<script lang="ts" context="module">
	import { z } from 'zod';

	export const editAllocationSchema = z.object({
		id: z.string(),
		category: z.string().max(32).trim().optional(),
		percentage: z
			.string()
			.regex(/^0*\.\d*[1-9]{1}0*$/, 'Invalid percentage.')
			.optional()
	});

	export type EditAllocationSchema = typeof editAllocationSchema;
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';
	import type { RecordModel } from 'pocketbase';
	import type { SuperValidated } from 'sveltekit-superforms';

	// props
	export let allocations: RecordModel[];
	export let form: SuperValidated<EditAllocationSchema>;

	const allocationsObj = allocations.map((alloc) => ({ label: alloc.category, value: alloc.id }));

	// edit allocation selected variables
	let selected: Selected<string> | undefined = undefined;
	$: selectedObj = allocations.find((alloc) => alloc.id === selected?.value);
</script>

<h4 class="text-lg">Edit</h4>
<p class="text-muted-foreground text-sm">Select the allocation you want to edit.</p>
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

<!-- {@const allocation = allocations.find((alloc) => alloc.id === $selected?.value)} -->
<Form.Root
	method="POST"
	action="?/editAllocation"
	{form}
	schema={editAllocationSchema}
	let:config
	class="space-y-4 w-full lg:w-2/3"
>
	<Form.Item>
		<Form.Field {config} name="id">
			<Form.Input type="hidden" value={selectedObj?.id} />
		</Form.Field>
	</Form.Item>
	<Form.Item>
		<Form.Field {config} name="category">
			<Form.Label>Category</Form.Label>
			<Form.Input placeholder={selectedObj?.category} disabled={!selected} />
			<Form.Validation />
		</Form.Field>
	</Form.Item>
	<Form.Item>
		<Form.Field {config} name="percentage">
			<Form.Label>Percentage</Form.Label>
			<Form.Input placeholder={selectedObj?.percentage} disabled={!selected} />
			<Form.Validation />
		</Form.Field>
	</Form.Item>
	<Form.Button disabled={!selected}>Update</Form.Button>
</Form.Root>
