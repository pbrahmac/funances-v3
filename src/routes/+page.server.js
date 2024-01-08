import { dateRangeSchema } from '$lib/schemas/dateRangeSchema';
import {
	dateWindow,
	formatDate,
	monthlyTotalExpenses,
	monthlyTotalIncomes,
	stringToZonedDateTime
} from '$lib/utils';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';

// initialize time range dates
let [beginningDate, endDate] = dateWindow('month');
let chosenPreset = 'Month';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	try {
		// get data from Pocketbase
		const expenses = await event.locals.pb.collection('expenses').getFullList({
			filter: `date >= "${formatDate(beginningDate.toDate(), true, true)}" && date <= "${formatDate(
				endDate.toDate(),
				true,
				true
			)}"`,
			expand: 'expense_type'
		});
		const expenseTypes = await event.locals.pb.collection('expense_types').getFullList();
		const incomes = await event.locals.pb.collection('income').getFullList({
			filter: `date >= "${formatDate(beginningDate.toDate(), true, true)}" && date <= "${formatDate(
				endDate.toDate(),
				true,
				true
			)}"`
		});
		const allocations = await event.locals.pb.collection('allocations').getFullList();

		return {
			expenses,
			incomes,
			expenseTypes,
			allocations,
			chosenPreset,
			beginningDate: beginningDate.toDate(),
			endDate: endDate.toDate()
		};
	} catch (/** @type {any} */ err) {
		return fail(400, err);
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	updateWindow: async (event) => {
		const form = await superValidate(event, dateRangeSchema);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		[beginningDate, endDate] = [
			stringToZonedDateTime(form.data.start, 'start'),
			stringToZonedDateTime(form.data.end, 'end')
		];
		chosenPreset = form.data.preset ?? '';
	}
};
