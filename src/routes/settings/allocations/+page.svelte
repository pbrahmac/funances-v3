<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';
	import AllocationsTable from './AllocationsTable.svelte';
	import EditAllocationsForm from './EditAllocationsForm.svelte';

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
	<EditAllocationsForm form={data.editAllocationForm} allocations={data.allocations} />
</div>
