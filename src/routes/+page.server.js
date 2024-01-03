import { monthlyTotalExpenses, monthlyTotalIncomes } from '$lib/utils';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	try {
		// get raw data from pocketbase
		// const expenseTypes = await event.locals.pb.collection('expense_types').getFullList();
		const expenseTotals = await event.locals.pb.collection('expense_aggregates').getFullList();
		const incomeTotals = await event.locals.pb.collection('income').getFullList();

		return {
			monthlyTotalExpenses: monthlyTotalExpenses(expenseTotals),
			monthlyTotalIncomes: monthlyTotalIncomes(incomeTotals),
			totalExpenses: expenseTotals.reduce((sum, entry) => sum + entry.amount, 0),
			totalIncomes: incomeTotals.reduce(
				(sum, entry) =>
					sum + entry.gross_amount - (entry.taxes + entry.benefits + entry.retirement_401k),
				0
			)
		};
	} catch (/** @type {any} */ err) {
		return fail(400, err);
	}
}
