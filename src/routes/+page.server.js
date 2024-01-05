import { datePresetSchema } from '$lib/schemas/dateRangeSchema';
import { dateWindow, formatDate, monthlyTotalExpenses, monthlyTotalIncomes } from '$lib/utils';
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
	month: async (event) => {
		const form = await superValidate(event, datePresetSchema);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		[beginningDate, endDate] = dateWindow(form.data.preset.toLowerCase());
		chosenPreset = form.data.preset;
	},
	quarter: async (event) => {
		const form = await superValidate(event, datePresetSchema);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		[beginningDate, endDate] = dateWindow(form.data.preset.toLowerCase());
		chosenPreset = form.data.preset;
	},
	ytd: async (event) => {
		const form = await superValidate(event, datePresetSchema);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		[beginningDate, endDate] = dateWindow(form.data.preset.toLowerCase());
		chosenPreset = form.data.preset;
	},
	year: async (event) => {
		const form = await superValidate(event, datePresetSchema);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		[beginningDate, endDate] = dateWindow(form.data.preset.toLowerCase());
		chosenPreset = form.data.preset;
	}
};
