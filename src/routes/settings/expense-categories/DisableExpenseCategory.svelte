<script lang="ts" context="module">
	import { z } from 'zod';
	export const disableExpenseCategorySchema = z.object({
		id: z.string()
	});

	export type DisableExpenseCategorySchema = typeof disableExpenseCategorySchema;
</script>

<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Selected } from 'bits-ui';
	import type { RecordModel } from 'pocketbase';
	import { InfoCircled } from 'radix-icons-svelte';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';

	// props
	export let categories: RecordModel[];
	export let form: SuperValidated<DisableExpenseCategorySchema>;

	const categoriesObj = categories.map((category) => ({
		label: category.type,
		value: category.id
	}));

	// edit allocation selected variables
	let selected: Selected<string> | undefined = undefined;

	// progressive enhancement functions
	const submitDisableExpenseCategory: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				toast.success('Disabled expense category.');
			} else {
				toast.error('Something went wrong.');
			}
			await applyAction(result);
		};
	};
</script>

<div class="mb-4">
	<div class="flex items-center space-x-2">
		<h4 class="text-lg">Disable</h4>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<InfoCircled class="h-4 w-4" />
			</Tooltip.Trigger>
			<Tooltip.Content class="lg:w-2/3">
				<p class="text-sm">
					Expense categories cannot be deleted, since older expenses may still use them. However,
					they can be disabled so they don't show up in forms and on the dashboard.
				</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>
	<p class="text-muted-foreground text-sm">Select the category you want to disable.</p>
</div>

<Select.Root items={categoriesObj} bind:selected>
	<Select.Trigger class="lg:w-2/3">
		<Select.Value placeholder="Select category" />
	</Select.Trigger>
	<Select.Content>
		{#each categories as category}
			<Select.Item value={category.id}>
				{category.type}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>

<Form.Root
	method="POST"
	{form}
	schema={disableExpenseCategorySchema}
	let:config
	class="space-y-4 w-full lg:w-2/3"
	asChild
>
	<form action="?/disableExpenseCategory" method="post" use:enhance={submitDisableExpenseCategory}>
		<Form.Item>
			<Form.Field {config} name="id">
				<Form.Input type="hidden" value={selected?.value} />
			</Form.Field>
		</Form.Item>
		<Form.Button variant="destructive" disabled={!selected}>Disable</Form.Button>
	</form>
</Form.Root>
