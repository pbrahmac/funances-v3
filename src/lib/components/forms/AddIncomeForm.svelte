<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { addIncomeSchema } from '$lib/schemas/addIncome';
	import type { Income } from '$lib/utils';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let form: SuperValidated<typeof addIncomeSchema>;
	export let store: Writable<Income[]>;

	const submitAddIncome: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				store.set($page.data.incomes?.items);
			}
			await applyAction(result);
		};
	};
</script>

<Dialog.Content class="max-w-sm">
	<Dialog.Header>
		<Dialog.Title>Add Income</Dialog.Title>
	</Dialog.Header>
	<Form.Root {form} schema={addIncomeSchema} class="m-4" let:config asChild>
		<form action="?/addIncome" method="post" use:enhance={submitAddIncome}>
			<Form.Field {config} name="date">
				<Form.Item>
					<Form.Label>Date</Form.Label>
					<Form.Input type="date" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="income">
				<Form.Item>
					<Form.Label>Income</Form.Label>
					<Form.Input />
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
			<Form.Field {config} name="gross_amount">
				<Form.Item>
					<Form.Label>Amount</Form.Label>
					<Form.Input inputmode="decimal" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="taxes">
				<Form.Item>
					<Form.Label>Taxes</Form.Label>
					<Form.Input inputmode="decimal" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="retirement_401k">
				<Form.Item>
					<Form.Label>401k</Form.Label>
					<Form.Input inputmode="decimal" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="benefits">
				<Form.Item>
					<Form.Label>Benefits</Form.Label>
					<Form.Input inputmode="decimal" />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="is_paycheck">
				<Form.Item class="flex items-end space-x-2">
					<Form.Label>Paycheck?</Form.Label>
					<Form.Checkbox />
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Dialog.Close>
				<Form.Button class="mt-4" type="submit">Add</Form.Button>
			</Dialog.Close>
		</form>
	</Form.Root>
</Dialog.Content>
