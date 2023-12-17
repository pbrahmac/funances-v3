<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { formatPercentage } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';

	// props
	export let allocations: RecordModel[];

	$: allocationsTotal = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
</script>

<div class="w-full p-3 flex items-center justify-center">
	<div class="w-full lg:w-2/3">
		<Table.Root>
			<Table.Caption>List of current allocations.</Table.Caption>
			<Table.Header>
				<Table.Row class="">
					<Table.Head>Allocation</Table.Head>
					<Table.Head class="text-right">Percentage</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each allocations as alloc}
					<Table.Row>
						<Table.Cell>{alloc.category}</Table.Cell>
						<Table.Cell class="text-right">{formatPercentage(alloc.percentage)}</Table.Cell>
					</Table.Row>
				{/each}
				<Table.Row class="font-semibold">
					<Table.Cell>Total</Table.Cell>
					<Table.Cell class="text-right">
						<span class="px-1 py-1" class:bg-red-400={allocationsTotal > 1}
							>{formatPercentage(allocationsTotal)}</span
						>
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
</div>
