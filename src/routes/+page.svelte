<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Cookie, Rocket } from 'radix-icons-svelte';
	import { formatCurrency } from '$lib/utils';
	import SparklineChart from '$lib/components/charts/SparklineChart.svelte';

	// props
	export let data: PageData;

	// overview cards data
	const overview_cards = [
		{
			title: 'Expenses',
			icon: Cookie,
			description: 'Total money spent.',
			chart: SparklineChart,
			chartOptions: { data: data.monthlyTotalExpenses, color: '#dc2626' },
			amount: formatCurrency(data.totalExpenses ?? 0)
		},
		{
			title: 'Income',
			icon: Rocket,
			description: 'Total post-tax money earned.',
			chart: SparklineChart,
			chartOptions: { data: data.monthlyTotalIncomes, color: '#16a34a' },
			amount: formatCurrency(data.totalIncomes ?? 0)
		}
	];
	console.log(data.monthlyTotalExpenses);
</script>

<div class="fullPageContainer p-6 space-y-4">
	<!-- overview cards -->
	<div class="w-full flex flex-col items-center justify-center">
		<div class="grid grid-flow-col gap-4 max-w-7xl">
			{#each overview_cards as card, idx}
				<Card.Root class="overflow-hidden">
					<Card.Header>
						<div class="flex items-center justify-between space-x-4">
							<Card.Title class="text-md">{card.title}</Card.Title>
							<svelte:component this={card.icon} class="w-5 h-5 p-0" />
						</div>
						<Card.Description>{card.description}</Card.Description>
					</Card.Header>
					<Card.Content>
						<h2 class="text-3xl font-bold">{card.amount}</h2>
					</Card.Content>
					<Card.Footer class="p-0 m-0">
						<div>
							{#if card.chart}
								<svelte:component this={card.chart} chartIdx={idx} {...card.chartOptions} />
							{/if}
						</div>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</div>
	<!-- expense/income switcher tab -->
	<div class="flex justify-center">
		<Tabs.Root value="expenses" class="flex flex-col items-center">
			<Tabs.List>
				<Tabs.Trigger value="expenses">Expenses</Tabs.Trigger>
				<Tabs.Trigger value="income">Income</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="expenses">Expense dashboards to go here.</Tabs.Content>
			<Tabs.Content value="income">Income dashboards to go here.</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
