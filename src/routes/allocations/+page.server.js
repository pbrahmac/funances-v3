import { z } from 'zod';
import { formatDate } from '$lib/utils';
import { superValidate } from 'sveltekit-superforms/client';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	// set dates for beginning and end of current year (to filter fetch)
	const thisYear = new Date().getUTCFullYear();
	let [fromDate, toDate] = [new Date(`01-01-${thisYear}`), new Date(`12-31-${thisYear}`)];
	toDate = new Date(toDate.getTime() + 86400 * 1000 - 1);

	// get data
	async function getAllocations() {
		// fetch from Pocketbase
		const rawAllocations = await event.locals.pb.collection('allocations').getFullList();
		/**
		 * @type {import('$lib/utils').Allocation[]}
		 */
		const allocations = rawAllocations.map((allocation) => ({
			id: allocation.id,
			category: allocation.category,
			percentage: allocation.percentage
		}));
		return allocations;
	}

	async function getIncomes() {
		// fetch from Pocketbase
		const rawIncomes = await event.locals.pb.collection('income').getFullList({
			filter: `date >= "${formatDate(fromDate)}" && date <= "${formatDate(toDate)}"`
		});
		/**
		 * @type {import('$lib/utils').Income[]}
		 */
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
		return incomes;
	}

	async function getAllocationStatuses() {
		const rawAllocationStatuses = await event.locals.pb
			.collection('allocation_status')
			.getFullList({ expand: 'allocation_id', filter: `year=${thisYear}` });
		/**
		 * @type {import('$lib/utils').AllocationStatus[]}
		 */
		const allocationStatuses = rawAllocationStatuses.map((status) => ({
			id: status.id,
			year: status.year,
			month: status.month - 1,
			allocation: status.expand?.allocation_id.category,
			isAllocated: status.isAllocated
		}));
		return allocationStatuses;
	}

	/**
	 * Aggregates income totals by month
	 * @param {import('$lib/utils').Income[]} incomeTotals raw income total data from PocketBase
	 * @returns {number[]}
	 */
	function monthlyTotalIncomes(incomeTotals) {
		/**
		 * @type {Map<number, number>}
		 */
		const monthIncomeMap = new Map(
			[...Array(new Date().getMonth() + 1).keys()].map((num) => [num, 0])
		);

		incomeTotals.forEach((income) => {
			const monthIdx = new Date(income.date).getMonth();
			const postTaxIncome =
				income.gross_amount - (income.benefits + income.retirement_401k + income.taxes);

			monthIncomeMap.set(monthIdx, (monthIncomeMap.get(monthIdx) ?? 0) + postTaxIncome);
		});
		return Array.from(monthIncomeMap.values());
	}

	/**
	 * Calculates how much to allocate to each category each month
	 * @param {import('$lib/utils').Allocation[]} allocations array of allocation percentages
	 * @param {number[]} monthlyIncomeTotals array of total income per month
	 */
	async function eachMonthAllocationAmount(allocations, monthlyIncomeTotals) {
		/**
		 * @type {Map<number, Map<string, number>>}
		 */
		const monthlyAllocationMap = new Map([...Array(12).entries()]);
		monthlyAllocationMap.forEach((_, k) => {
			/**
			 * @type {Map<string, number>}
			 */
			const allocationAmountMap = new Map(
				[...allocations.values()].map((obj) => [obj.category, obj.percentage])
			);
			allocationAmountMap.forEach((v_inner, k_inner) => {
				allocationAmountMap.set(k_inner, v_inner * (monthlyIncomeTotals.at(k) ?? 0));
			});
			monthlyAllocationMap.set(k, allocationAmountMap);
		});
		return monthlyAllocationMap;
	}

	/**
	 * Makes a 2D map of allocation statuses
	 * @param {import('$lib/utils').AllocationStatus[]} allocationStatuses array of statuses of each allocation
	 */
	async function eachMonthAllocationStatus(allocationStatuses) {
		/**
		 * @type {Map<number, Map<string, {id: string, status: boolean}>>}
		 */
		const monthlyAllocationMap = new Map([...Array(12).entries()]);
		allocationStatuses.forEach((status) => {
			if (!monthlyAllocationMap.get(status.month)) {
				const categoryMap = new Map([
					[status.allocation, { id: status.id, status: status.isAllocated }]
				]);
				monthlyAllocationMap.set(status.month, categoryMap);
			} else {
				monthlyAllocationMap
					.get(status.month)
					?.set(status.allocation, { id: status.id, status: status.isAllocated });
			}
		});
		return monthlyAllocationMap;
	}

	const allocations = await getAllocations();
	const incomes = await getIncomes();
	const allocationStatuses = await getAllocationStatuses();

	return {
		allocations: getAllocations(),
		incomes: getIncomes(),
		eachMonthAllocationAmount: eachMonthAllocationAmount(allocations, monthlyTotalIncomes(incomes)),
		eachMonthAllocationStatus: eachMonthAllocationStatus(allocationStatuses)
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	updateChecked: async (event) => {
		const form = await superValidate(
			event,
			z.object({
				id: z.string({ required_error: 'Required.' }).trim(),
				month: z.string({ required_error: 'Required.' }).trim(),
				allocation_id: z.string({ required_error: 'Required.' }).trim()
			})
		);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// auth user and get id
			const user_id = event.locals.user?.id;

			// get current allocation status
			let currStatus;
			try {
				currStatus = await event.locals.pb.collection('allocation_status').getOne(form.data.id);
			} catch (err) {
				console.log('Undefined current allocation status.');
			}

			// create form data object for creation or updating
			const allocationObj = {
				year: new Date().getFullYear(),
				month: form.data.month,
				user_id: user_id,
				allocation_id: form.data.allocation_id,
				isAllocated: form.data.id !== 'undefined' ? !currStatus?.isAllocated : true
			};

			if (form.data.id === 'undefined') {
				// create allocation status and set it to true IF id is undefined
				await event.locals.pb.collection('allocation_status').create(allocationObj);
			} else {
				// update allocation status
				await event.locals.pb.collection('allocation_status').update(form.data.id, allocationObj);
			}
		} catch (/**@type {any} */ err) {
			console.log(err.status, err.message);
			return fail(400, { form });
		}

		return { form };
	}
};
