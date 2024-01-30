<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { checkColorContrast, cn, getTextColorFromBackground } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { clickToCopyAction } from 'svelte-legos';
	import { toast } from 'svelte-sonner';

	// props
	export let categories: RecordModel[];

	checkColorContrast('#123456');
</script>

<div class="w-full p-3 flex items-center justify-center">
	<div class="w-full lg:w-2/3">
		<Table.Root>
			<Table.Caption>
				<div>List of current expense categories.</div>
			</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Category</Table.Head>
					<Table.Head class="text-right">Color</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each categories as category}
					<Table.Row>
						<Table.Cell class={!category.isEnabled ? 'text-muted-foreground line-through' : ''}>
							{category.type}
						</Table.Cell>
						<Table.Cell class="text-right">
							<button
								use:clickToCopyAction={category.tagColor}
								on:copy-done={() => toast.success('Copied!')}
								class={cn(
									'px-2 py-1 rounded font-mono cursor-copy',
									getTextColorFromBackground(category.tagColor)
								)}
								style={`background-color: ${category.tagColor}`}
							>
								{category.tagColor}
							</button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
