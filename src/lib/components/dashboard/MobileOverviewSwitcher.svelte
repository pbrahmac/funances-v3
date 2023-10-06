<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import OverviewCard from '$lib/components/dashboard/OverviewCard.svelte';
	import Button from '../ui/button/button.svelte';
	import { CaretDown, CaretUp } from 'radix-icons-svelte';

	// props
	export let expenseCards: {
		title: string;
		icon: any;
		subtext: string;
		amount: string;
	}[];

	export let incomeCards: {
		title: string;
		icon: any;
		subtext: string;
		amount: string;
	}[];

	// open/close switchers
	$: isOverviewOpen = true;
</script>

<div class="flex lg:hidden justify-center">
	<Tabs.Root value="expenses" class="flex flex-col items-center w-full">
		<div class="flex items-center justify-between w-full space-x-2">
			<Tabs.List class="mb-4">
				<Tabs.Trigger value="expenses">Expenses</Tabs.Trigger>
				<Tabs.Trigger value="income">Income</Tabs.Trigger>
			</Tabs.List>
			<Button on:click={() => (isOverviewOpen = !isOverviewOpen)} variant="ghost" class="mb-4">
				{#if isOverviewOpen}
					<CaretDown class="w-5 h-5" />
				{:else}
					<CaretUp class="w-5 h-5" />
				{/if}
			</Button>
		</div>
		{#if isOverviewOpen}
			<Tabs.Content value="expenses">
				<div class="grid grid-flow-row gap-4 max-w-7xl">
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
				<div class="grid grid-flow-row gap-4 max-w-7xl">
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
		{/if}
	</Tabs.Root>
</div>
