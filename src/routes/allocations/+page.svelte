<script lang="ts">
	import type { PageData } from './$types';
	import * as Tabs from '$lib/components/ui/tabs';
	import AllocationAmountTable from './AllocationAmountTable.svelte';
	import AllocationStatusTable from './AllocationStatusTable.svelte';
	import AllocationPercentageTable from './AllocationPercentageTable.svelte';

	// props
	export let data: PageData;

	const monthIdxs = [...data.eachMonthAllocationAmount.keys()];
	const allocationNames = data.allocations.map((obj) => ({ id: obj.id, allocation: obj.category }));
</script>

<svelte:head>
	<title>Allocations</title>
</svelte:head>

<div class="fullPageContainer p-6">
	<Tabs.Root value="status" class="flex flex-col items-center justify-center">
		<Tabs.List class="w-fit mb-6">
			<Tabs.Trigger value="status">Statuses</Tabs.Trigger>
			<Tabs.Trigger value="amount">Amounts</Tabs.Trigger>
			<Tabs.Trigger value="percentage">Percentages</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="status" class="w-full xl:max-w-6xl">
			<AllocationStatusTable
				{allocationNames}
				{monthIdxs}
				eachMonthAllocationStatus={data.eachMonthAllocationStatus}
			/>
		</Tabs.Content>
		<Tabs.Content value="amount" class="w-full xl:max-w-6xl">
			<AllocationAmountTable
				{allocationNames}
				{monthIdxs}
				eachMonthAllocationAmount={data.eachMonthAllocationAmount}
			/>
		</Tabs.Content>
		<Tabs.Content value="percentage" class="w-full xl:max-w-xl">
			<AllocationPercentageTable allocations={data.allocations} />
		</Tabs.Content>
	</Tabs.Root>
</div>
