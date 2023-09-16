<script lang="ts">
  import { enhance } from '$app/forms';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Form from '$lib/components/ui/form';
  import * as Sheet from '$lib/components/ui/sheet';
	import { addExpenseSchema } from '$lib/schemas/addExpense';
	import type { ExpenseCategory } from '$lib/utils';
	import type { SuperValidated } from 'sveltekit-superforms';
  
  export let form: SuperValidated<typeof addExpenseSchema>;
  export let categories: ExpenseCategory[];

  // TODO: figure out how to make page reload on form submit OR progressive enhancement
</script>

<Sheet.Content side="right">
  <Sheet.Header>
    <Sheet.Title>Add an Expense</Sheet.Title>
  </Sheet.Header>
  <Form.Root method="POST" action="?/addExpense" {form} schema={addExpenseSchema} class="m-4" let:config>
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
    <Form.Button class="mt-2" type="submit">Add</Form.Button>
  </Form.Root>
</Sheet.Content>
