<script lang="ts" context="module">
	import { z } from 'zod';

	export const editExpenseCategorySchema = z.object({
		id: z.string(),
		category: z.string().max(32).trim().optional(),
		tagColor: z
			.string()
			.regex(/^#[a-fA-F0-9]{6}$/, 'Invalid hex value.')
			.optional()
	});

	export type EditExpenseCategorySchema = typeof editExpenseCategorySchema;
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
	export let categories: RecordModel[];
	export let form: SuperValidated<EditExpenseCategorySchema>;

	const categoriesObj = categories.map((category) => ({
		label: category.type,
		value: category.id
	}));

	// edit category selected variables
	let selected: Selected<string> | undefined = undefined;
	$: selectedObj = categories.find((category) => category.id === selected?.value);

	// progressive enhancement functions
	const submitEditExpenseCategory: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				toast.success('Updated expense category.');
			} else {
				toast.error('Something went wrong.');
			}
			await applyAction(result);
		};
	};
</script>

<div class="mb-4">
	<h4 class="text-lg">Edit</h4>
	<p class="text-muted-foreground text-sm">Select the category you want to edit.</p>
</div>
<Select.Root items={categoriesObj} bind:selected>
	<Select.Trigger class="lg:w-2/3">
		<Select.Value placeholder="Select category" />
	</Select.Trigger>
	<Select.Content>
		{#each categories as category}
			<Select.Item
				class={!category.isEnabled ? 'line-through text-muted-foreground' : ''}
				value={category.id}>{category.type}</Select.Item
			>
		{/each}
	</Select.Content>
</Select.Root>

<Form.Root
	method="POST"
	{form}
	schema={editExpenseCategorySchema}
	let:config
	class="space-y-4 w-full lg:w-2/3"
	asChild
>
	<form action="?/editExpenseCategory" method="post" use:enhance={submitEditExpenseCategory}>
		<Form.Item>
			<Form.Field {config} name="id">
				<Form.Input type="hidden" value={selected?.value} />
			</Form.Field>
		</Form.Item>
		<Form.Item>
			<Form.Field {config} name="category">
				<Form.Label>Category</Form.Label>
				<Form.Input placeholder={selectedObj?.type} disabled={!selected} />
				<Form.Validation />
			</Form.Field>
		</Form.Item>
		<Form.Item>
			<Form.Field {config} name="tagColor">
				<Form.Label>Color</Form.Label>
				<Form.Input placeholder={selectedObj?.tagColor} disabled={!selected} />
				<Form.Validation />
				<span class="text-muted-foreground text-sm">Put the hexadecimal value (e.g. #f39237).</span>
			</Form.Field>
		</Form.Item>
		<Form.Button disabled={!selected}>Update</Form.Button>
	</form>
</Form.Root>
