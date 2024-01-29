<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import type { Writable } from 'svelte/store';
	import { AverageExpenseCard, CategoryListCard } from '.';
	import { CarbonSparklineChart, EChartsDonutChart } from '../charts';
	import { onMount } from 'svelte';
	import { Loader2 } from 'lucide-svelte';

	// props
	export let expensesStore: Writable<RecordModel[]>;

	// loading indicator
	let loading = true;
	onMount(() => {
		loading = false;
	});

	// bento classes
	const commonClasses = 'w-full justify-center justify-self-center';
	const smallClasses = 'grid grid-cols-1 gap-2 p-2';
	const mediumClasses = 'md:grid-cols-6 md:grid-rows-6 md:gap-3 md:p-3';
	const largeClasses = 'xl:grid-cols-12 xl:grid-rows-12 xl:gap-4 xl:p-4 xl:max-w-screen-2xl';
</script>

{#if loading}
	<Loader2 class="w-8 h-8 animate-spin stroke-muted-foreground" />
{:else}
	<div class={cn(commonClasses, smallClasses, mediumClasses, largeClasses)}>
		<div class="col-span-1 md:col-span-2 md:row-span-1 xl:col-span-4 xl:row-span-1">
			<AverageExpenseCard {expensesStore} title="Expense Averages" />
		</div>
		<div class="col-span-1 md:col-span-2 md:row-span-1 xl:col-span-4 xl:row-span-1">
			<CategoryListCard {expensesStore} title="Biggest Spenders" areBiggest={true} />
		</div>
		<div class="col-span-1 md:col-span-2 md:row-span-1 xl:col-span-4 xl:row-span-1">
			<CategoryListCard {expensesStore} title="Smallest Spenders" areBiggest={false} />
		</div>
		<div class="col-span-full md:col-span-3 md:row-span-2 xl:col-span-4 xl:row-span-3">
			<EChartsDonutChart
				chartIdx={1}
				chartName="Expenses by Category"
				chartRawData={$page.data.expenses}
			/>
		</div>
		<div class="col-span-full md:col-span-3 md:row-span-2 xl:col-span-4 xl:row-span-3">
			<CarbonSparklineChart
				chartIdx={2}
				chartName="Expenses by Month"
				chartRawData={$page.data.expenses}
			/>
		</div>
	</div>
{/if}
