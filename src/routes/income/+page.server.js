import { addIncomeSchema } from '$lib/schemas/addIncome';
import { dateRangeSchema } from '$lib/schemas/dateRangeSchema';
import { dateWindow, formatDate } from '$lib/utils';
import { fromDate, getLocalTimeZone, today } from '@internationalized/date';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';

// Constants and initial variables
let [beginningDate, endDate] = [...dateWindow('ytd')];

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	// initialize forms
	const addIncomeForm = await superValidate(addIncomeSchema);
	const dateRangeForm = await superValidate(dateRangeSchema);

	// get limit param for safety
	const limit = Number(event.url.searchParams.get('limit')) || 10;

	/**
	 * Gets paginated list of expenses from Pocketbase
	 * @param {number} limit The number of items displayed per page
	 */
	async function getIncomes(limit = 10) {
		// validate limit (to not fetch too many records at once)
		if (limit > 100) {
			throw error(400, 'Bad Request');
		}

		// fetch from Pocketbase
		try {
			const rawIncomes = await event.locals.pb.collection('income').getFullList({
				filter: `date >= "${formatDate(
					beginningDate.toDate(),
					true,
					true
				)}" && date <= "${formatDate(endDate.toDate(), true, true)}"`,
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
		beginningDate: formatDate(beginningDate.toDate(), false, false),
		endDate: formatDate(endDate.toDate(), false, false),
		incomes: await getIncomes(limit)
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

			// use @internationalized/date to fix timezone issues
			const nativeTodayDate = new Date();
			const localDate = fromDate(nativeTodayDate, getLocalTimeZone()).set({
				year: nativeTodayDate.getFullYear(),
				month: nativeTodayDate.getMonth() + 1,
				day: nativeTodayDate.getDate()
			});
			// const localDate = fromDate(new Date(form.data.date), getLocalTimeZone())
			// 	.set({
			// 		hour: nativeTodayDate.getHours(),
			// 		minute: nativeTodayDate.getMinutes(),
			// 		second: nativeTodayDate.getSeconds(),
			// 		millisecond: nativeTodayDate.getMilliseconds()
			// 	})
			// 	.add({ days: 1 });

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
				date: localDate.toAbsoluteString()
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

		// use @internationalized/date
		let newBeginningDate = fromDate(new Date(form.data.start), getLocalTimeZone()).set({
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		});
		let newEndDate = fromDate(new Date(form.data.end), getLocalTimeZone())
			.set({
				hour: 23,
				minute: 59,
				second: 59,
				millisecond: 999
			})
			.add({ days: 1 });

		/**
		 * update beginning and end dates
		 * load function will re-run on page submit, causing data with new dates to be pulled
		 */
		[beginningDate, endDate] = [newBeginningDate, newEndDate];

		return { form };
	}
};
