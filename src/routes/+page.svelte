<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Cookie, Rocket } from 'radix-icons-svelte';
	import { formatCurrency } from '$lib/utils';

	// props
	export let data: PageData;

	// overview cards data
	const overview_cards = [
		{
			title: 'Expenses',
			icon: Cookie,
			description: 'Total of all expenses this year.',
			amount: formatCurrency(5000)
		},
		{
			title: 'Income',
			icon: Rocket,
			description: 'Total of all income this year.',
			amount: formatCurrency(5000)
		}
	];
</script>

<div class="fullPageContainer p-6">
	<!-- <h2 class="text-6xl mb-8">{`Hello, ${data?.user?.firstName} ${data?.user?.lastName}.`}</h2>
  <p class="text-2xl text-muted-foreground">This is the dashboard page.</p>
  <Separator class="my-3" /> -->

	<div class="w-full flex items-center justify-center">
		<div class="grid grid-flow-col gap-4 max-w-7xl">
			{#each overview_cards as card}
				<Card.Root class="max-h-60">
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
				</Card.Root>
			{/each}
		</div>
	</div>
</div>
