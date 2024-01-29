<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { ProgressBarChart } from '$lib/components/charts';
	import { BentoGrid } from '$lib/components/dashboard';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { dateWindow } from '$lib/utils';
	import {
		DateFormatter,
		fromDate,
		getLocalTimeZone,
		toCalendarDate
	} from '@internationalized/date';
	import { Calendar } from 'radix-icons-svelte';
	import { writable } from 'svelte/store';
	import type { SubmitFunction } from './$types';

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
	<div class="flex flex-col items-center w-full">
		<!-- time range nav -->
		<div
			class="w-full xl:max-w-7xl flex flex-wrap justify-center md:justify-between items-center space-y-4 md:space-y-0 pb-6"
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
		<BentoGrid {expensesStore} />
	</div>
</div>
