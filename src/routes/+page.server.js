import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	try {
		// get raw data from pocketbase
		const expenseTypes = await event.locals.pb.collection('expense_types').getFullList(50);
		const rawExpenseTotals = await event.locals.pb
			.collection('expense_aggregates')
			.getFullList({ requestKey: null });

		const rawIncomeTotals = await event.locals.pb
			.collection('income')
			.getFullList({ requestKey: null });

		// helper functions to process data as needed
		/**
		 * Returns expense totals by month
		 * @param {import('pocketbase').RecordModel[]} rawExpenseTotals raw expense total data from PocketBase
		 * * @param {import('pocketbase').RecordModel[]} expenseTypes types of expenses
		 */
		function monthlyTotalExpenses(rawExpenseTotals, expenseTypes) {
			if (!rawExpenseTotals) {
				return;
			}
			const numMonths = Math.ceil(rawExpenseTotals.length / expenseTypes.length);
			const monthlyTotals = [...Array(numMonths).keys()].map((monthIdx) => {
				const filteredEntries = rawExpenseTotals.filter((entry) => entry.month === monthIdx + 1);
				return filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
			});

			return monthlyTotals;
		}

		/**
		 * Returns income totals by month
		 * @param {import('pocketbase').RecordModel[]} rawIncomeTotals raw income total data from PocketBase
		 * @returns {number[]}
		 */
		function monthlyTotalIncomes(rawIncomeTotals) {
			/**
			 * @type {Map<number, number>}
			 */
			const monthIncomeMap = new Map();

			rawIncomeTotals.forEach((income) => {
				const monthIdx = new Date(income.date).getMonth();
				const postTaxIncome =
					income.gross_amount - (income.benefits + income.retirement_401k + income.taxes);

				monthIncomeMap.set(monthIdx, (monthIncomeMap.get(monthIdx) ?? 0) + postTaxIncome);
			});
			return Array.from(monthIncomeMap.values());
		}

		monthlyTotalIncomes(rawIncomeTotals);

		return {
			monthlyTotalExpenses: monthlyTotalExpenses(rawExpenseTotals, expenseTypes),
			monthlyTotalIncomes: monthlyTotalIncomes(rawIncomeTotals),
			totalExpenses: rawExpenseTotals.reduce((sum, entry) => sum + entry.amount, 0),
			totalIncomes: rawIncomeTotals.reduce(
				(sum, entry) =>
					sum + entry.gross_amount - (entry.taxes + entry.benefits + entry.retirement_401k),
				0
			),
			incomes: rawIncomeTotals
		};
	} catch (/** @type {any} */ err) {
		return fail(400, err);
	}
}
