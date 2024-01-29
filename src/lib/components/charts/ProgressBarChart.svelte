<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { cn, formatCurrency, formatPercentage } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let expensesStore: Writable<RecordModel[]>;
	export let incomesStore: Writable<RecordModel[]>;
	export let allocations: RecordModel[];

	let message: string | undefined = undefined;
	let underlineColor: string;
	let expenseTotal: number;
	let incomeTotal: number;

	let loading = true;

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
		loading = false;
	});
</script>

{#if loading}
	<div class="w-full flex flex-col items-center justify-center space-y-4 py-4">
		<Skeleton class="w-11/12 md:w-1/3 md:max-w-xl h-4 rounded-full" />
		<Skeleton class="w-full md:w-1/2 md:max-w-2xl h-2 rounded-full" />
		<div class="flex items-center justify-between w-full md:w-1/2 md:max-w-2xl">
			<Skeleton class="w-20 h-4 rounded-full" />
			<Skeleton class="w-20 h-4 rounded-full" />
		</div>
	</div>
{:else}
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
{/if}
