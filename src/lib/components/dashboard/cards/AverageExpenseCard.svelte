<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { formatCurrency } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate } from 'svelte';
	import type { Writable } from 'svelte/store';

	// props
	export let expensesStore: Writable<RecordModel[]>;
	export let title: string;

	let [mean, median] = [0, 0];

	afterUpdate(() => {
		// mean
		const sum = $expensesStore.reduce((sum, expense) => sum + expense.amount, 0);
		mean = sum / $expensesStore.length;

		// median
		const sortedExpenses = $expensesStore.sort((a, b) => a.amount - b.amount);
		median = sortedExpenses[Math.floor(sortedExpenses.length / 2)].amount;
	});
</script>

<Card.Root class="w-full h-full">
	<Card.Header class="pb-4">
		<Card.Title class="text-center">{title}</Card.Title>
	</Card.Header>
	<Card.Content class="flex space-x-2 items-center justify-center h-3/5">
		<Badge>{`Mean - ${formatCurrency(mean)}`}</Badge>
		<Badge>{`Median - ${formatCurrency(median)}`}</Badge>
	</Card.Content>
	<Card.Footer />
</Card.Root>
