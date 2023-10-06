import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	try {
		// get raw data from pocketbase
		// const expenseTypes = await event.locals.pb.collection('expense_types').getFullList();
		const rawExpenseTotals = await event.locals.pb.collection('expense_aggregates').getFullList();
		const rawIncomeTotals = await event.locals.pb.collection('income').getFullList();

		// helper functions to process data as needed
		/**
		 * Returns expense totals by month
		 * @param {import('pocketbase').RecordModel[]} rawExpenseTotals raw expense total data from PocketBase
		 */
		function monthlyTotalExpenses(rawExpenseTotals) {
			if (!rawExpenseTotals) {
				return;
			}
			const monthExpenseMap = new Map(
				[...Array(new Date().getMonth() + 1).keys()].map((num) => [num, 0])
			);

			rawExpenseTotals.forEach((item) => {
				const currMonth = item.month - 1;
				if (!monthExpenseMap.get(currMonth)) {
					monthExpenseMap.set(currMonth, item.amount);
				} else {
					const curr = monthExpenseMap.get(currMonth);
					monthExpenseMap.set(currMonth, curr + item.amount);
				}
			});

			return [...monthExpenseMap.values()];
		}

		/**
		 * Aggregates income totals by month
		 * @param {import('pocketbase').RecordModel[]} rawIncomeTotals raw income total data from PocketBase
		 * @returns {number[]}
		 */
		function monthlyTotalIncomes(rawIncomeTotals) {
			/**
			 * @type {Map<number, number>}
			 */
			const monthIncomeMap = new Map(
				[...Array(new Date().getMonth() + 1).keys()].map((num) => [num, 0])
			);

			rawIncomeTotals.forEach((income) => {
				const monthIdx = new Date(income.date).getMonth();
				const postTaxIncome =
					income.gross_amount - (income.benefits + income.retirement_401k + income.taxes);

				monthIncomeMap.set(monthIdx, (monthIncomeMap.get(monthIdx) ?? 0) + postTaxIncome);
			});
			return Array.from(monthIncomeMap.values());
		}

		return {
			monthlyTotalExpenses: monthlyTotalExpenses(rawExpenseTotals),
			monthlyTotalIncomes: monthlyTotalIncomes(rawIncomeTotals),
			totalExpenses: rawExpenseTotals.reduce((sum, entry) => sum + entry.amount, 0),
			totalIncomes: rawIncomeTotals.reduce(
				(sum, entry) =>
					sum + entry.gross_amount - (entry.taxes + entry.benefits + entry.retirement_401k),
				0
			)
		};
	} catch (/** @type {any} */ err) {
		return fail(400, err);
	}
}
