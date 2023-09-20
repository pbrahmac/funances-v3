<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { editExpenseSchema } from '$lib/schemas/editExpense';

	export let data: PageData;
</script>

<div class="fullPageContainer p-6 flex items-center justify-center">
	<Card.Root class="max-w-xl">
		<Card.Header>
			<Card.Title>Edit Expense</Card.Title>
		</Card.Header>
		<Form.Root
			method="POST"
			form={data.form}
			schema={editExpenseSchema}
			class="m-2 w-96"
			let:config
		>
			<Card.Content>
				<input type="hidden" name="expenseId" value={data.expense?.id} />
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
						<Form.Input type="text" />
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
								{#each data.expenseTypes as category}
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
			</Card.Content>
			<Card.Footer>
				<Form.Button class="mt-2" type="submit">Update</Form.Button>
			</Card.Footer>
		</Form.Root>
	</Card.Root>
</div>
