<script lang="ts">
	import type { RecordModel } from 'pocketbase';
	import * as Table from '$lib/components/ui/table';

	// props
	export let categories: RecordModel[];
</script>

<div class="w-full p-3 flex items-center justify-center">
	<div class="w-full lg:w-2/3">
		<Table.Root>
			<Table.Caption>List of current expense categories.</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Category</Table.Head>
					<Table.Head class="text-right">Color</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each categories as category}
					<Table.Row>
						<Table.Cell>{category.type}</Table.Cell>
						<Table.Cell class="text-right">
							<span class="px-2 py-1 rounded" style={`background-color: ${category.tagColor}`}>
								{category.tagColor}
							</span>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
