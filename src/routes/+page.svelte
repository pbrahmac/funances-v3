<script lang="ts">
	import { MobileOverviewSwitcher, OverviewCard } from '$lib/components/dashboard';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';
	import { calcLastMonthRatio, dateWindow, formatCurrency, monthIdxToName } from '$lib/utils';
	import { BadgeCent, BadgeDollarSign, Landmark, PiggyBank } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { CarbonDonutChart, ProgressBarChart } from '$lib/components/charts';
	import type { RecordModel } from 'pocketbase';
	import { page } from '$app/stores';
	import { applyAction, enhance } from '$app/forms';
	import { writable } from 'svelte/store';
	import {
		DateFormatter,
		fromDate,
		getLocalTimeZone,
		toCalendarDate
	} from '@internationalized/date';
	import { Calendar } from 'radix-icons-svelte';
	import type { SubmitFunction } from './$types';
	import { invalidateAll } from '$app/navigation';

	// overview cards data
	// const expenseCards = [
	// 	{
	// 		title: `${monthIdxToName((data.monthlyTotalExpenses?.length ?? 0) - 1, 'long')} Expenses`,
	// 		icon: BadgeCent,
	// 		subtext: `${calcLastMonthRatio(data.monthlyTotalExpenses, 'thisMonth')}`,
	// 		amount: formatCurrency(data.monthlyTotalExpenses?.at(-1) ?? -1)
	// 	},
	// 	{
	// 		title: 'Total Expenses',
	// 		icon: BadgeDollarSign,
	// 		subtext: 'Total money spent.',
	// 		amount: formatCurrency(data.totalExpenses ?? 0)
	// 	}
	// ];
	// const incomeCards = [
	// 	{
	// 		title: `${monthIdxToName((data.monthlyTotalIncomes?.length ?? 0) - 2, 'long')} Income`,
	// 		icon: PiggyBank,
	// 		subtext: `${calcLastMonthRatio(data.monthlyTotalIncomes, 'lastMonth')}`,
	// 		amount: formatCurrency(data.monthlyTotalIncomes?.at(-2) ?? -1)
	// 	},
	// 	{
	// 		title: 'Total Income',
	// 		icon: Landmark,
	// 		subtext: 'Total money earned.',
	// 		amount: formatCurrency(data.totalIncomes ?? 0)
	// 	}
	// ];

	// time range variables
	const timeRangeItems = [
		{ label: 'Month' },
		{ label: 'Quarter' },
		{ label: 'YTD' },
		{ label: 'Year' }
	];
	$: selected = $page.data.chosenPreset;

	const df = new DateFormatter('en-US', { dateStyle: 'medium' });
	const localTZ = getLocalTimeZone();
	const timeRangeStore = writable({
		beginningDate: toCalendarDate(fromDate($page.data.beginningDate, localTZ)),
		endDate: toCalendarDate(fromDate($page.data.endDate, localTZ))
	});

	// chart data update
	let expensesStore = writable($page.data.expenses);
	let incomesStore = writable($page.data.incomes);

	// progressive enhancement functions
	const submitUpdateTimeRange: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				expensesStore.set($page.data.expenses);
				incomesStore.set($page.data.incomes);
			}
			await applyAction(result);
		};
	};
</script>

<svelte:head>
	<title>Funances</title>
</svelte:head>

<div class="fullPageContainer p-6">
	<div
		class="flex flex-wrap justify-center md:justify-between items-center space-y-4 md:space-y-0 pb-6"
	>
		<Button disabled variant="outline">
			<Calendar class="mr-2 w-4 h-4" />
			{`${df.format($timeRangeStore.beginningDate.toDate(localTZ))} - ${df.format(
				$timeRangeStore.endDate.toDate(localTZ)
			)}`}
		</Button>
		<form
			method="post"
			action="?/updateWindow"
			class="flex items-center justify-end space-x-4"
			use:enhance={submitUpdateTimeRange}
		>
			{#each timeRangeItems as item}
				<button
					type="submit"
					class={buttonVariants({ variant: 'ghost' })}
					class:bg-secondary={selected === item.label}
					on:click={() => {
						selected = item.label;
						let [newBeginningDate, newEndDate] = dateWindow(item.label.toLowerCase());
						$timeRangeStore = {
							beginningDate: toCalendarDate(newBeginningDate),
							endDate: toCalendarDate(newEndDate)
						};
					}}
				>
					{item.label}
				</button>
			{/each}
			<input type="hidden" name="start" bind:value={$timeRangeStore.beginningDate} />
			<input type="hidden" name="end" bind:value={$timeRangeStore.endDate} />
			<input type="hidden" name="preset" bind:value={selected} />
		</form>
	</div>
	<Separator />
	<ProgressBarChart {expensesStore} {incomesStore} allocations={$page.data.allocations} />
	<div class="grid grid-cols-6 gap-4 justify-center justify-self-center w-full p-4">
		<div class="col-span-full md:col-span-3 xl:col-span-2">
			<CarbonDonutChart
				chartIdx={3}
				chartName="Expenses by Category"
				chartRawData={$page.data.expenses}
			/>
		</div>
	</div>
</div>

<!-- <div class="fullPageContainer p-6">
	<MobileOverviewSwitcher {expenseCards} {incomeCards} />
	<div class="hidden lg:flex justify-center">
		<Tabs.Root value="expenses" class="flex flex-col items-start w-full">
			<div class="flex items-start justify-between w-full">
				<Tabs.List class="mb-4">
					<Tabs.Trigger value="expenses">Expenses</Tabs.Trigger>
					<Tabs.Trigger value="income">Income</Tabs.Trigger>
				</Tabs.List>
				<Button variant="secondary" disabled><kbd class="font-mono">⌘K to search</kbd></Button>
			</div>
			<Tabs.Content value="expenses">
				<div class="grid grid-flow-row lg:grid-flow-col gap-4 max-w-7xl">
					{#each expenseCards as card}
						<OverviewCard
							title={card.title}
							subtext={card.subtext}
							amount={card.amount}
							icon={card.icon}
						/>
					{/each}
				</div>
			</Tabs.Content>
			<Tabs.Content value="income">
				<div class="grid grid-flow-col gap-4 max-w-7xl">
					{#each incomeCards as card}
						<OverviewCard
							title={card.title}
							subtext={card.subtext}
							amount={card.amount}
							icon={card.icon}
						/>
					{/each}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div> -->
