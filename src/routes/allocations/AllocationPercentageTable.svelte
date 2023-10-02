<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { formatPercentage, type Allocation } from '$lib/utils';

	// props
	export let allocations: Allocation[];
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Allocation</Table.Head>
			<Table.Head>Percentage</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each allocations as allocation}
			<Table.Row>
				<Table.Cell>{allocation.category}</Table.Cell>
				<Table.Cell>{formatPercentage(allocation.percentage)}</Table.Cell>
			</Table.Row>
		{/each}
		<Table.Row class="font-semibold">
			<Table.Cell>Total</Table.Cell>
			<Table.Cell>
				{formatPercentage(allocations.reduce((sum, allocation) => sum + allocation.percentage, 0))}
			</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>
