<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';
	import AllocationsTable from './AllocationsTable.svelte';
	import EditAllocationsForm from './EditAllocationsForm.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import AddAllocationForm from './AddAllocationForm.svelte';

	export let data: PageData;
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Allocations</h3>
		<p class="text-sm text-muted-foreground">
			Add, remove, or change allocation names and percentages.
		</p>
	</div>
	<AllocationsTable allocations={data.allocations} />
	<Separator />
	<Tabs.Root value="edit" class="flex flex-col space-y-4">
		<Tabs.List class="self-center">
			<Tabs.Trigger value="add">Add</Tabs.Trigger>
			<Tabs.Trigger value="edit">Edit</Tabs.Trigger>
			<Tabs.Trigger value="delete">Delete</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="add">
			<AddAllocationForm form={data.addAllocationForm} />
		</Tabs.Content>
		<Tabs.Content value="edit">
			<EditAllocationsForm form={data.editAllocationForm} allocations={data.allocations} />
		</Tabs.Content>
		<Tabs.Content value="delete">Delete form here</Tabs.Content>
	</Tabs.Root>
</div>
