import { addExpenseSchema } from '$lib/schemas/addExpense';
import { dateRangeSchema } from '$lib/schemas/dateRangeSchema';
import { formatDate, serializeNonPOJOs } from '$lib/utils';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';

/**
 * Returns two dates in the LOCAL time zone: today and 1 month before today
 */
const dateWindow = () => {
	const localTZ = getLocalTimeZone();
	let beginningDate = fromDate(new Date(), localTZ)
		.subtract({ months: 1 })
		.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
	let endDate = fromDate(new Date(), localTZ).set({
		hour: 23,
		minute: 59,
		second: 59,
		millisecond: 999
	});
	return [beginningDate, endDate];
};

// Constants and initial variables
let [beginningDate, endDate] = [...dateWindow()];

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	// initialize forms
	const addExpenseForm = await superValidate(addExpenseSchema);
	const dateRangeForm = await superValidate(dateRangeSchema);

	// get limit param for safety
	const limit = Number(event.url.searchParams.get('limit')) || 10;

	/**
	 * Gets paginated list of expenses from Pocketbase
	 * @param {number} limit The number of items displayed per page
	 */
	async function getExpenses(limit = 10) {
		// validate limit (to not fetch too many records at once)
		if (limit > 100) {
			throw error(400, 'Bad Request');
		}

		// fetch from Pocketbase
		try {
			const rawExpenses = await event.locals.pb.collection('expenses').getFullList({
				filter: `date >= "${formatDate(
					beginningDate.toDate(),
					true,
					true
				)}" && date <= "${formatDate(endDate.toDate(), true, true)}"`,
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
			.getFullList(50, { filter: 'isEnabled = true', sort: 'type' });

		return rawExpenseTypes.map((expenseType) => ({
			id: expenseType.id,
			name: expenseType.type,
			color: expenseType.tagColor
		}));
	}

	return {
		addExpenseForm: addExpenseForm,
		dateRangeForm: dateRangeForm,
		beginningDate: formatDate(beginningDate.toDate(), false, false),
		endDate: formatDate(endDate.toDate(), false, false),
		expenses: await getExpenses(limit),
		expenseTypes: await getExpenseTypes()
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

			// use @internationalized/date to fix timezone issues
			const nativeTodayDate = new Date();
			const localDate = fromDate(new Date(form.data.date), getLocalTimeZone())
				.set({
					hour: nativeTodayDate.getHours(),
					minute: nativeTodayDate.getMinutes(),
					second: nativeTodayDate.getSeconds(),
					millisecond: nativeTodayDate.getMilliseconds()
				})
				.add({ days: 1 });

			// make request to create new expense record
			await event.locals.pb.collection('expenses').create({
				user_id: user_id,
				expense_type: form.data.type,
				date: localDate.toAbsoluteString(),
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
							`month = ${localDate.month} && year = ${localDate.year} && type_id = "${form.data.type}"`
						)
				);

				await event.locals.pb.collection('expense_aggregates').update(aggregateRecord.id, {
					user_id: user_id,
					type_id: form.data.type,
					amount: aggregateRecord.amount + parseFloat(form.data.amount),
					month: localDate.month,
					year: localDate.year
				});
			} catch (/** @type {any} */ err) {
				if (err.status == 404) {
					try {
						await event.locals.pb.collection('expense_aggregates').create({
							user_id: user_id,
							type_id: form.data.type,
							amount: form.data.amount,
							month: localDate.month,
							year: localDate.year
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
			const deletedExpenseDate = fromDate(deletedExpense.date, getLocalTimeZone());

			// delete record
			await event.locals.pb.collection('expenses').delete(form.data.id);

			// update aggregates table
			try {
				const aggregateRecord = serializeNonPOJOs(
					await event.locals.pb
						.collection('expense_aggregates')
						.getFirstListItem(
							`month = ${deletedExpenseDate.month} && year = ${deletedExpenseDate.year} && type_id = "${deletedExpense.expense_type}"`
						)
				);
				await event.locals.pb.collection('expense_aggregates').update(aggregateRecord.id, {
					user_id: user_id,
					type_id: deletedExpense.expense_type,
					amount: aggregateRecord.amount - deletedExpense.amount,
					month: deletedExpenseDate.month,
					year: deletedExpenseDate.year
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
				const deletedExpenseDate = fromDate(deletedExpense.date, getLocalTimeZone());

				// delete record
				await event.locals.pb.collection('expenses').delete(itemId, { requestKey: null });

				// update aggregates table
				try {
					const aggregateRecord = await event.locals.pb
						.collection('expense_aggregates')
						.getFirstListItem(
							`month = ${deletedExpenseDate.month} && year = ${deletedExpenseDate.year} && type_id = "${deletedExpense.expense_type}"`,
							{ requestKey: null }
						);
					await event.locals.pb.collection('expense_aggregates').update(
						aggregateRecord.id,
						{
							user_id: user_id,
							type_id: deletedExpense.expense_type,
							amount: aggregateRecord.amount - deletedExpense.amount,
							month: deletedExpenseDate.month,
							year: deletedExpenseDate.year
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
		const form = await superValidate(event, dateRangeSchema);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		// use @internationalized/date
		let newBeginningDate = fromDate(new Date(form.data.start), getLocalTimeZone()).set({
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		});
		let newEndDate = fromDate(new Date(form.data.end), getLocalTimeZone()).set({
			hour: 23,
			minute: 59,
			second: 59,
			millisecond: 999
		});

		/**
		 * update beginning and end dates
		 * load function will re-run on page submit, causing data with new dates to be pulled
		 */
		[beginningDate, endDate] = [newBeginningDate, newEndDate];

		return { form };
	}
};
