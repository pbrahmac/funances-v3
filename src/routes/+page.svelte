<script lang="ts">
	import { MobileOverviewSwitcher, OverviewCard } from '$lib/components/dashboard';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import { calcLastMonthRatio, formatCurrency, monthIdxToName } from '$lib/utils';
	import { BadgeCent, BadgeDollarSign, Landmark, PiggyBank } from 'lucide-svelte';
	import type { PageData } from './$types';

	// props
	export let data: PageData;

	// overview cards data
	const expenseCards = [
		{
			title: `${monthIdxToName((data.monthlyTotalExpenses?.length ?? 0) - 1, 'long')} Expenses`,
			icon: BadgeCent,
			subtext: `${calcLastMonthRatio(data.monthlyTotalExpenses, 'thisMonth')}`,
			amount: formatCurrency(data.monthlyTotalExpenses?.at(-1) ?? -1)
		},
		{
			title: 'Total Expenses',
			icon: BadgeDollarSign,
			subtext: 'Total money spent.',
			amount: formatCurrency(data.totalExpenses ?? 0)
		}
	];
	const incomeCards = [
		{
			title: `${monthIdxToName((data.monthlyTotalIncomes?.length ?? 0) - 2, 'long')} Income`,
			icon: PiggyBank,
			subtext: `${calcLastMonthRatio(data.monthlyTotalIncomes, 'lastMonth')}`,
			amount: formatCurrency(data.monthlyTotalIncomes?.at(-2) ?? -1)
		},
		{
			title: 'Total Income',
			icon: Landmark,
			subtext: 'Total money earned.',
			amount: formatCurrency(data.totalIncomes ?? 0)
		}
	];

	// chart stuff
	// chart: SparklineChart,
	// chartOptions: { data: data.monthlyTotalIncomes, color: '#16a34a' },
</script>

<svelte:head>
	<title>Funances</title>
</svelte:head>

<div class="fullPageContainer p-6">
	<!-- mobile overview switcher -->
	<MobileOverviewSwitcher {expenseCards} {incomeCards} />
	<!-- expense/income switcher tab -->
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
</div>
