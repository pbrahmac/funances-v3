<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { monthIdxToName } from '$lib/utils';
	import { Check, Cross2 } from 'radix-icons-svelte';

	// props
	export let allocationNames: string[];
	export let monthIdxs: number[];
	export let eachMonthAllocationStatus: Map<number, Map<string, boolean>>;
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
						{#if eachMonthAllocationStatus.get(idx)?.get(name)}
							<Check class="stroke-affirmative" />
						{:else}
							<Cross2 class="stroke-negative" />
						{/if}
					</Table.Cell>
				{/each}
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
