<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { cn, formatCurrency, formatPercentage } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let expensesStore: Writable<RecordModel[]>;
	export let incomesStore: Writable<RecordModel[]>;
	export let allocations: RecordModel[];

	let message: string;
	let underlineColor: string;
	let expenseTotal: number;
	let incomeTotal: number;

	let leftOverPercentage = 1 - allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);

	afterUpdate(() => {
		expenseTotal = $expensesStore.reduce((sum, expense) => sum + expense.amount, 0);
		incomeTotal = $incomesStore.reduce(
			(sum, income) =>
				sum + (income.gross_amount - income.taxes - income.benefits - income.retirement_401k),
			0
		);
		incomeTotal *= leftOverPercentage;

		if (incomeTotal === 0) {
			message = 'No income for this time period.';
			underlineColor = 'decoration-red-400';
		} else if (expenseTotal === 0) {
			message = "Haven't spent anything? Wowww.";
			underlineColor = 'decoration-emerald-400';
		} else if (expenseTotal > incomeTotal) {
			message = `You're ${formatCurrency(expenseTotal - incomeTotal)} in the hole.`;
			underlineColor = 'decoration-red-400';
		} else if (expenseTotal === incomeTotal) {
			message = 'Expenses and income, balanced. As all things should be.';
			underlineColor = 'decoration-yellow-400';
		} else {
			const ratio = expenseTotal / incomeTotal;
			underlineColor =
				ratio > 0.8
					? 'decoration-red-400'
					: ratio > 0.5
					? 'decoration-yellow-400'
					: 'decoration-emerald-400';
			message = `${formatPercentage(1 - ratio, 0, false)} (${formatCurrency(
				incomeTotal - expenseTotal,
				true
			)}) left to spend!`;
		}
	});
</script>

<div class="w-full py-4 flex flex-col space-y-4 items-center">
	<div
		class={cn(
			'text-xl md:text-2xl font-bold text-center w-full underline underline-offset-2',
			underlineColor
		)}
	>
		{message}
	</div>
	<Progress value={expenseTotal} max={incomeTotal} class="w-full md:w-1/2 md:max-w-2xl" />
	<div class="flex items-center justify-between space-x-2 w-full md:w-1/2 md:max-w-2xl font-bold">
		<p>{formatCurrency(expenseTotal)}</p>
		<p>{formatCurrency(incomeTotal)}</p>
	</div>
</div>
