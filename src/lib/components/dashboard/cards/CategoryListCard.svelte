<script lang="ts">
	import { CategoryBadge } from '$lib/components/misc';
	import * as Card from '$lib/components/ui/card';
	import { expensesToCategoryArrays, formatCurrency } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate } from 'svelte';
	import type { Writable } from 'svelte/store';

	// props
	export let expensesStore: Writable<RecordModel[]>;
	export let title: string;
	export let numCategories = 3;
	export let areBiggest: boolean = true;

	let categories: [string, [string, number]][];

	afterUpdate(() => {
		let chartData = expensesToCategoryArrays($expensesStore);
		const sortedMap = [...chartData.map.entries()].sort((a, b) => a[1][1] - b[1][1]);
		const slicedMap = areBiggest
			? sortedMap.slice(sortedMap.length - numCategories)
			: sortedMap.slice(0, numCategories);
		categories = areBiggest ? slicedMap.reverse() : slicedMap;
	});
</script>

<Card.Root class="w-full h-full">
	<Card.Header class="pb-4">
		<Card.Title class="text-center">{title}</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col space-y-2 items-center justify-center h-2/3">
		{#each categories ?? [] as category}
			<CategoryBadge
				name={`${category[0]} - ${formatCurrency(category[1][1])}`}
				color={category[1][0]}
			/>
		{/each}
	</Card.Content>
	<Card.Footer />
</Card.Root>
