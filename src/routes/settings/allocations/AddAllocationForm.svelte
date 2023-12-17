<script lang="ts" context="module">
	import { z } from 'zod';
	export const addAllocationSchema = z.object({
		category: z.string().min(2, 'Required field').max(32).trim(),
		percentage: z
			.string()
			.min(2, 'Required field')
			.regex(/^0*\.\d*[1-9]{1}0*$/, 'Invalid percentage.')
	});

	export type AddAllocationSchema = typeof addAllocationSchema;
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import type { SuperValidated } from 'sveltekit-superforms';

	// props
	export let form: SuperValidated<AddAllocationSchema>;
</script>

<div class="mb-4">
	<h4 class="text-lg">Add</h4>
	<p class="text-muted-foreground text-sm">Add a new allocation.</p>
</div>

<Form.Root
	method="POST"
	action="?/addAllocation"
	{form}
	schema={addAllocationSchema}
	let:config
	class="space-y-4 w-full lg:w-2/3"
>
	<Form.Item>
		<Form.Field {config} name="category">
			<Form.Label>Category</Form.Label>
			<Form.Input />
			<Form.Validation />
		</Form.Field>
	</Form.Item>
	<Form.Item>
		<Form.Field {config} name="percentage">
			<Form.Label>Percentage</Form.Label>
			<Form.Input />
			<Form.Validation />
			<span class="text-muted-foreground text-sm">Put the decimal value.</span>
		</Form.Field>
	</Form.Item>
	<Form.Button>Add</Form.Button>
</Form.Root>
