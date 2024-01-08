<script lang="ts" context="module">
	import { z } from 'zod';
	export const deleteAllocationSchema = z.object({
		id: z.string()
	});

	export type DeleteAllocationSchema = typeof deleteAllocationSchema;
</script>

<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Selected } from 'bits-ui';
	import type { RecordModel } from 'pocketbase';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';

	// props
	export let allocations: RecordModel[];
	export let form: SuperValidated<DeleteAllocationSchema>;

	const allocationsObj = allocations.map((alloc) => ({ label: alloc.category, value: alloc.id }));

	// edit allocation selected variables
	let selected: Selected<string> | undefined = undefined;

	// progressive enhancement functions
	const submitDeleteAllocation: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				toast.success('Deleted allocation.');
			} else {
				toast.error('Something went wrong.');
			}
			await applyAction(result);
		};
	};
</script>

<div class="mb-4">
	<h4 class="text-lg">Delete</h4>
	<p class="text-muted-foreground text-sm">Select the allocation you want to delete.</p>
</div>

<Select.Root items={allocationsObj} bind:selected>
	<Select.Trigger class="lg:w-2/3">
		<Select.Value placeholder="Select allocation" />
	</Select.Trigger>
	<Select.Content>
		{#each allocations as alloc}
			<Select.Item value={alloc.id}>{alloc.category}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>

<Form.Root
	method="POST"
	{form}
	schema={deleteAllocationSchema}
	let:config
	class="space-y-4 w-full lg:w-2/3"
	asChild
>
	<form action="?/deleteAllocation" method="post" use:enhance={submitDeleteAllocation}>
		<Form.Item>
			<Form.Field {config} name="id">
				<Form.Input type="hidden" value={selected?.value} />
			</Form.Field>
		</Form.Item>
		<Form.Button variant="destructive" disabled={!selected}>Delete</Form.Button>
	</form>
</Form.Root>
