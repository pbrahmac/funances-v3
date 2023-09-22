import { addExpenseSchema } from '$lib/schemas/addExpense';
import { dateWindowSchemaMaker } from '$lib/schemas/dateWindowSchema';
import { formatDate, serializeNonPOJOs } from '$lib/utils';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';

// helper functions
const dateWindow = (monthOffset = 1) => {
	let [fromDate, toDate] = [new Date(), new Date()];
	// reset both to 00:00:00
	fromDate.setMonth(fromDate.getMonth() - monthOffset);
	fromDate.setHours(0, 0, 0, 0);
	toDate.setHours(0, 0, 0, 0);
	// set initial end date to be until 11:59:59 of that day
	toDate = new Date(toDate.getTime() + 86400 * 1000 - 1);
	return { from: fromDate, to: toDate };
};

// Constants and initial variables
let [fromDate, toDate] = [dateWindow().from, dateWindow().to];

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	// initialize forms
	const addExpenseForm = await superValidate(addExpenseSchema);
	const dateWindowForm = await superValidate(dateWindowSchemaMaker(fromDate, toDate));

	// get limit and pageNum params for pagination
	const limit = Number(event.url.searchParams.get('limit')) || 10;
	const pageNum = Number(event.url.searchParams.get('pageNum')) || 1;

	/**
	 * Gets paginated list of expenses from Pocketbase
	 * @param {number} limit The number of items displayed per page
	 * @param {number} pageNum The offset (for pagination)
	 */
	async function getExpenses(limit = 10, pageNum = 1) {
		// validate limit (to not fetch too many records at once)
		if (limit > 100) {
			throw error(400, 'Bad Request');
		}

		// fetch from Pocketbase
		try {
			const rawExpenses = await event.locals.pb.collection('expenses').getFullList({
				filter: `date >= "${formatDate(fromDate, false)}" && date <= "${formatDate(toDate)}"`,
				sort: '-date',
				expand: 'expense_type'
			});

			const expenses = rawExpenses.map((expense) => ({
				id: expense.id,
				date: expense.date,
				expense: expense.title,
				category: {
					id: expense.expand?.expense_type.id,
					name: expense.expand?.expense_type.type || 'N/A',
					color: expense.expand?.expense_type.tagColor || '#64748b'
				},
				notes: expense.details,
				amount: expense.amount
			}));

			return {
				items: expenses
			};
		} catch (/** @type {any} */ err) {
			console.log(err.status, err.message);
		}
	}

	async function getExpenseTypes() {
		// fetch expense type information
		const rawExpenseTypes = await event.locals.pb
			.collection('expense_types')
			.getFullList(50, { sort: 'type' });

		return rawExpenseTypes.map((expenseType) => ({
			id: expenseType.id,
			name: expenseType.type,
			color: expenseType.tagColor
		}));
	}

	return {
		addExpenseForm: addExpenseForm,
		dateWindowForm: dateWindowForm,
		dateWindow: { from: fromDate, to: toDate },
		expenses: getExpenses(limit, pageNum),
		expenseTypes: getExpenseTypes()
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	addExpense: async (event) => {
		const form = await superValidate(event, addExpenseSchema);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// auth user and get id
			const user_id = event.locals.user?.id;

			// add current time to inputted date
			const inputtedDate = new Date(form.data.date);
			let finalDate = new Date();
			finalDate.setDate(inputtedDate.getDate());
			finalDate.setMonth(inputtedDate.getMonth());
			finalDate.setFullYear(inputtedDate.getFullYear());

			// make request to create new expense record
			await event.locals.pb.collection('expenses').create({
				user_id: user_id,
				expense_type: form.data.type,
				date: finalDate.toISOString(),
				title: form.data.expense,
				details: form.data.notes ?? '',
				amount: form.data.amount
			});

			// update aggregates table
			try {
				const aggregateRecord = serializeNonPOJOs(
					await event.locals.pb
						.collection('expense_aggregates')
						.getFirstListItem(
							`month = ${finalDate.getMonth() + 1} && type_id = "${form.data.type}"`
						)
				);

				await event.locals.pb.collection('expense_aggregates').update(aggregateRecord.id, {
					user_id: user_id,
					type_id: form.data.type,
					amount: aggregateRecord.amount + parseFloat(form.data.amount),
					month: finalDate.getMonth() + 1,
					year: finalDate.getFullYear()
				});
			} catch (/** @type {any} */ err) {
				if (err.status == 404) {
					try {
						await event.locals.pb.collection('expense_aggregates').create({
							user_id: user_id,
							type_id: form.data.type,
							amount: form.data.amount,
							month: finalDate.getMonth() + 1,
							year: finalDate.getFullYear()
						});
					} catch (/** @type {any} */ err) {
						console.log('Error: ', err);
						return fail(err.status, { form });
					}
				} else {
					console.log('Error: ', err);
					return fail(err.status, { form });
				}
			}
		} catch (/** @type {any} */ err) {
			console.log('Error: ', err);
			return fail(400, { form });
		}

		return { success: true };
	},
	delete: async (event) => {
		const form = await superValidate(
			event,
			z.object({
				id: z.string({ required_error: 'Required.' }).trim()
			})
		);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// auth user and get id
			const user_id = event.locals.user?.id;

			// get details of to be deleted expense
			const deletedExpense = await event.locals.pb.collection('expenses').getOne(form.data.id);
			const deletedExpenseDate = new Date(deletedExpense.date);

			// delete record
			await event.locals.pb.collection('expenses').delete(form.data.id);

			// update aggregates table
			try {
				const aggregateRecord = serializeNonPOJOs(
					await event.locals.pb
						.collection('expense_aggregates')
						.getFirstListItem(
							`month = ${deletedExpenseDate.getMonth() + 1} && type_id = "${
								deletedExpense.expense_type
							}"`
						)
				);
				await event.locals.pb.collection('expense_aggregates').update(aggregateRecord.id, {
					user_id: user_id,
					type_id: deletedExpense.expense_type,
					amount: aggregateRecord.amount - deletedExpense.amount,
					month: deletedExpenseDate.getMonth() + 1,
					year: deletedExpenseDate.getFullYear()
				});

				if (aggregateRecord.amount - deletedExpense.amount == 0) {
					await event.locals.pb.collection('expense_aggregates').delete(aggregateRecord.id);
				}
			} catch (/** @type {any} */ err) {
				if (err.status == 404) {
					console.log('No record of aggregate here.');
				} else {
					console.log('Error: ', err);
					return fail(err.status, { form });
				}
			}
		} catch (err) {
			console.log('Error: ', err);
			return fail(400, { form });
		}

		return { form };
	},
	batchDelete: async (event) => {
		const formData = Array.from(await (await event.request.formData()).values());
		const itemsToDelete = formData.map((formData) => formData.toString());

		itemsToDelete.forEach(async (itemId) => {
			try {
				// auth user and get id
				const user_id = event.locals.user?.id;

				// get details of to be deleted expense
				const deletedExpense = await event.locals.pb
					.collection('expenses')
					.getOne(itemId, { requestKey: null });
				const deletedExpenseDate = new Date(deletedExpense.date);

				// delete record
				await event.locals.pb.collection('expenses').delete(itemId, { requestKey: null });

				// update aggregates table
				try {
					const aggregateRecord = await event.locals.pb
						.collection('expense_aggregates')
						.getFirstListItem(
							`month = ${deletedExpenseDate.getMonth() + 1} && type_id = "${
								deletedExpense.expense_type
							}"`,
							{ requestKey: null }
						);
					await event.locals.pb.collection('expense_aggregates').update(
						aggregateRecord.id,
						{
							user_id: user_id,
							type_id: deletedExpense.expense_type,
							amount: aggregateRecord.amount - deletedExpense.amount,
							month: deletedExpenseDate.getMonth() + 1,
							year: deletedExpenseDate.getFullYear()
						},
						{ requestKey: null }
					);

					if (aggregateRecord.amount - deletedExpense.amount == 0) {
						await event.locals.pb
							.collection('expense_aggregates')
							.delete(aggregateRecord.id, { requestKey: null });
					}
				} catch (/** @type {any} */ err) {
					if (err.status == 404) {
						console.log('No record of aggregate here.');
					} else {
						console.log('Error: ', err);
						return fail(err.status, err.message);
					}
				}
			} catch (/** @type {any} */ err) {
				console.log('Error: ', err);
				return fail(400, err.message);
			}
		});
		return { success: true };
	},
	updateWindow: async (event) => {
		const form = await superValidate(
			event,
			dateWindowSchemaMaker(dateWindow().from, dateWindow().to)
		);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		// fix timezone issues with dates
		// set from date to start at 12:00:00 AM
		let newFromDate = new Date(form.data.fromDatePicker);
		const fromEpoch = newFromDate.getTime();
		newFromDate = new Date(fromEpoch + newFromDate.getTimezoneOffset() * 60 * 1000);

		// set to date to end at 11:59:59 PM
		let newToDate = new Date(form.data.toDatePicker);
		const toEpoch = newToDate.getTime();
		newToDate = new Date(toEpoch + newToDate.getTimezoneOffset() * 60 * 1000 + 86400 * 1000 - 1);

		// update fromDate and toDate
		// load function will re-run on page submit, causing data with new dates to be pulled
		fromDate = newFromDate;
		toDate = newToDate;

		return { form };
	}
};
