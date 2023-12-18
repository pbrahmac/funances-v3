import { addIncomeSchema } from '$lib/schemas/addIncome';
import { dateRangeSchema } from '$lib/schemas/dateRangeSchema';
import { formatDate } from '$lib/utils';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';

// helper functions
const dateWindow = () => {
	let [fromDate, toDate] = [new Date(), new Date()];
	// reset both to 00:00:00 and from month to Jan
	fromDate.setMonth(0);
	fromDate.setDate(1);
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
	const addIncomeForm = await superValidate(addIncomeSchema);
	const dateRangeForm = await superValidate(dateRangeSchema);

	// get limit and pageNum params for pagination
	const limit = Number(event.url.searchParams.get('limit')) || 10;
	const pageNum = Number(event.url.searchParams.get('pageNum')) || 1;

	/**
	 * Gets paginated list of expenses from Pocketbase
	 * @param {number} limit The number of items displayed per page
	 * @param {number} pageNum The offset (for pagination)
	 */
	async function getIncomes(limit = 10, pageNum = 1) {
		// validate limit (to not fetch too many records at once)
		if (limit > 100) {
			throw error(400, 'Bad Request');
		}

		// fetch from Pocketbase
		try {
			const rawIncomes = await event.locals.pb.collection('income').getFullList({
				filter: `date >= "${formatDate(fromDate, false)}" && date <= "${formatDate(toDate)}"`,
				sort: '-date'
			});

			const incomes = rawIncomes.map((income) => ({
				id: income.id,
				date: income.date,
				income: income.title,
				notes: income.details,
				gross_amount: income.gross_amount,
				benefits: income.benefits,
				retirement_401k: income.retirement_401k,
				taxes: income.taxes,
				is_paycheck: income.is_paycheck
			}));

			return {
				items: incomes
			};
		} catch (/** @type {any} */ err) {
			console.log(err.status, err.message);
		}
	}

	return {
		addIncomeForm: addIncomeForm,
		dateRangeForm: dateRangeForm,
		dateWindow: { from: fromDate, to: toDate },
		incomes: await getIncomes(limit, pageNum)
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	addIncome: async (event) => {
		const form = await superValidate(event, addIncomeSchema);

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
			finalDate.setDate(inputtedDate.getUTCDate());
			finalDate.setMonth(inputtedDate.getUTCMonth());
			finalDate.setFullYear(inputtedDate.getUTCFullYear());

			// make request to create new expense record
			await event.locals.pb.collection('income').create({
				user_id: user_id,
				title: form.data.income,
				details: form.data.notes ?? '',
				gross_amount: form.data.gross_amount,
				taxes: form.data.taxes,
				benefits: form.data.benefits,
				retirement_401k: form.data.retirement_401k,
				is_paycheck: form.data.is_paycheck,
				date: finalDate.toISOString()
			});
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

		// delete record in database
		try {
			await event.locals.pb.collection('income').delete(form.data.id);
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

				// delete record
				await event.locals.pb.collection('income').delete(itemId, { requestKey: null });
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

		// fix timezone issues with dates
		// set from date to start at 12:00:00 AM
		let newFromDate = new Date(form.data.start);
		const fromEpoch = newFromDate.getTime();
		newFromDate = new Date(fromEpoch + newFromDate.getTimezoneOffset() * 60 * 1000);

		// set to date to end at 11:59:59 PM
		let newToDate = new Date(form.data.end);
		const toEpoch = newToDate.getTime();
		newToDate = new Date(toEpoch + newToDate.getTimezoneOffset() * 60 * 1000 + 86400 * 1000 - 1);

		// update fromDate and toDate
		// load function will re-run on page submit, causing data with new dates to be pulled
		fromDate = newFromDate;
		toDate = newToDate;

		return { form };
	}
};
