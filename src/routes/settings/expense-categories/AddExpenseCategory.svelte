<script lang="ts" context="module">
	import { z } from 'zod';

	export const addExpenseCategorySchema = z.object({
		category: z.string().min(2, 'Required field').max(32).trim(),
		tagColor: z
			.string()
			.min(2, 'Required field')
			.regex(/^#[a-fA-F0-9]{6}$/, 'Invalid hex value.')
	});

	export type AddExpenseCategorySchema = typeof addExpenseCategorySchema;
</script>

<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import type { SuperValidated } from 'sveltekit-superforms';

	// props
	export let form: SuperValidated<AddExpenseCategorySchema>;
</script>

<div class="mb-4">
	<h4 class="text-lg">Add</h4>
	<p class="text-muted-foreground text-sm">Add a new expense category.</p>
</div>

<Form.Root
	method="POST"
	action="?/addExpenseCategory"
	{form}
	schema={addExpenseCategorySchema}
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
		<Form.Field {config} name="tagColor">
			<Form.Label>Color</Form.Label>
			<Form.Input />
			<Form.Validation />
			<span class="text-muted-foreground text-sm">Put the hexadecimal value (e.g. #f39237).</span>
		</Form.Field>
	</Form.Item>
	<Form.Button>Add</Form.Button>
</Form.Root>
