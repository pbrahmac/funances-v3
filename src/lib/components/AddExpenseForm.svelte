<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { addExpenseSchema } from '$lib/schemas/addExpense';
	import type { Expense, ExpenseCategory } from '$lib/utils';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let form: SuperValidated<typeof addExpenseSchema>;
	export let categories: ExpenseCategory[];
	export let store: Writable<Expense[]>;

	const submitAddExpense: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				store.set($page.data.expenses?.items);
			}
			await applyAction(result);
		};
	};
</script>

<Dialog.Content class="max-w-sm">
	<Dialog.Header>
		<Dialog.Title>Add an Expense</Dialog.Title>
	</Dialog.Header>
	<Form.Root {form} schema={addExpenseSchema} class="m-4" let:config asChild>
		<form action="?/addExpense" method="post" use:enhance={submitAddExpense}>
			<Form.Field {config} name="date">
				<Form.Item>
					<Form.Label>Date</Form.Label>
					<Form.Input type="date" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="amount">
				<Form.Item>
					<Form.Label>Amount</Form.Label>
					<Form.Input inputmode="decimal" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="expense">
				<Form.Item>
					<Form.Label>Expense</Form.Label>
					<Form.Input />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="type">
				<Form.Item>
					<Form.Label>Category</Form.Label>
					<Form.Select>
						<Form.SelectTrigger placeholder="—" />
						<Form.SelectContent>
							{#each categories as category}
								<Form.SelectItem value={category.id}>{category.name}</Form.SelectItem>
							{/each}
						</Form.SelectContent>
					</Form.Select>
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="notes">
				<Form.Item>
					<Form.Label>Notes</Form.Label>
					<Form.Textarea class="resize-none" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Dialog.Close>
				<Form.Button class="mt-2" type="submit">Add</Form.Button>
			</Dialog.Close>
		</form>
	</Form.Root>
</Dialog.Content>
