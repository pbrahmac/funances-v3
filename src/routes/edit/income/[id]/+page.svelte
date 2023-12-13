<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { editIncomeSchema } from '$lib/schemas/editIncome';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Edit Income</title>
</svelte:head>

<div class="fullPageContainer p-6 flex items-center justify-center">
	<Card.Root class="max-w-xl">
		<Card.Header>
			<Card.Title>Edit Income</Card.Title>
		</Card.Header>
		<Form.Root method="POST" form={data.form} schema={editIncomeSchema} class="m-2 w-96" let:config>
			<Card.Content>
				<input type="hidden" name="id" value={data.income?.id} />
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
					<Form.Item>
						<Form.Label>Paycheck?</Form.Label>
						<Form.Checkbox />
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
