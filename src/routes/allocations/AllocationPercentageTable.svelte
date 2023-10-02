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
	</Table.Body>
</Table.Root>
