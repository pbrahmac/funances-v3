<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { formatCurrency, monthIdxToName } from '$lib/utils';

	// props
	export let allocationNames: string[];
	export let monthIdxs: number[];
	export let eachMonthAllocationAmount: Map<number, Map<string, number>>;
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head />
			{#each allocationNames as name}
				<Table.Head>{name}</Table.Head>
			{/each}
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each monthIdxs as idx}
			<Table.Row>
				<Table.Cell class="text-muted-foreground font-medium"
					>{monthIdxToName(idx, 'long')}</Table.Cell
				>
				{#each allocationNames as name}
					<Table.Cell>
						{formatCurrency(eachMonthAllocationAmount.get(idx)?.get(name) ?? -1)}
					</Table.Cell>
				{/each}
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
