<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { editExpenseSchema } from '$lib/schemas/editExpense';
	import { formatDatepickerString, type Expense, type ExpenseCategory } from '$lib/utils';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let expense: Expense;
	export let form: SuperValidated<typeof editExpenseSchema>;
	export let categories: ExpenseCategory[];
	export let store: Writable<Expense[]>;

	// change defaults of schema
	let newEditExpenseSchema = editExpenseSchema.extend({
		expense: editExpenseSchema.shape.expense.default(expense.expense),
		notes: editExpenseSchema.shape.notes.default(expense.notes),
		date: editExpenseSchema.shape.date.default(formatDatepickerString(new Date(expense.date))),
		type: editExpenseSchema.shape.type.default(
			categories.find((category) => (category.name = expense.category.name))?.id ?? ''
		),
		amount: editExpenseSchema.shape.amount.default(expense.amount)
	});

	const submitEditExpense: SubmitFunction = () => {
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
		<Dialog.Title>Edit Expense</Dialog.Title>
		<Dialog.Description>{JSON.stringify(expense, null, 2)}</Dialog.Description>
	</Dialog.Header>
	<Form.Root {form} schema={newEditExpenseSchema} class="m-4" let:config asChild>
		<form action="?/editExpense" method="post" use:enhance={submitEditExpense}>
			<input type="hidden" name="expenseId" value={expense.id} />
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
				<Form.Button class="mt-2" type="submit">Update</Form.Button>
			</Dialog.Close>
		</form>
	</Form.Root>
</Dialog.Content>
