import { monthlyTotalExpenses, monthlyTotalIncomes } from '$lib/utils';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	try {
		// get data from Pocketbase
		const expenses = await event.locals.pb
			.collection('expenses')
			.getFullList({ expand: 'expense_type' });
		const expenseTypes = await event.locals.pb.collection('expense_types').getFullList();
		const incomes = await event.locals.pb.collection('income').getFullList();

		return {
			expenses: expenses,
			incomes: incomes,
			expenseTypes: expenseTypes
			// monthlyTotalExpenses: monthlyTotalExpenses(expenses),
			// monthlyTotalIncomes: monthlyTotalIncomes(incomes),
			// totalExpenses: expenses.reduce((sum, entry) => sum + entry.amount, 0),
			// totalIncomes: incomes.reduce(
			// 	(sum, entry) =>
			// 		sum + entry.gross_amount - (entry.taxes + entry.benefits + entry.retirement_401k),
			// 	0
			// )
		};
	} catch (/** @type {any} */ err) {
		return fail(400, err);
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	month: async (event) => {
		console.log('month');
	},
	quarter: async (event) => {
		console.log('quarter');
	},
	ytd: async (event) => {
		console.log('ytd');
	},
	year: async (event) => {
		console.log('year');
	}
};
