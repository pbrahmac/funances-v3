<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Trash, Pencil1 } from "radix-icons-svelte";
	import type { Expense, ExpenseCategory } from '$lib/utils';
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { Writable } from 'svelte/store';
	import EditExpenseForm from '$lib/components/EditExpenseForm.svelte';
	import type { editExpenseSchema } from '$lib/schemas/editExpense';
	import type { SuperValidated } from 'sveltekit-superforms';

  export let expense: Expense;
  export let store: Writable<Expense[]>;
  export let form: SuperValidated<typeof editExpenseSchema>;
  export let categories: ExpenseCategory[];

  const submitDelete: SubmitFunction = () => {
    return async ({ result }) => {
      if (result.type == 'success') {
        await invalidateAll();
        store.set($page.data.expenses?.items)
      }
      await applyAction(result);
    }
  }
</script>

<div class="flex space-x-2 items-center justify-center">
  <!-- edit -->
  <Dialog.Root>
    <Dialog.Trigger>
      <Button variant="ghost" size="icon" class="w-8 h-8 p-0">
        <Pencil1 class="w-4 h-4" />
      </Button>
    </Dialog.Trigger>
    <EditExpenseForm {expense} {form} {categories} {store} />
  </Dialog.Root>

  <!-- delete -->
  <AlertDialog.Root>
    <AlertDialog.Trigger>
      <Button variant="ghost" size="icon" class="w-8 h-8 p-0">
        <Trash class="w-4 h-4" />
      </Button>
    </AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you sure?</AlertDialog.Title>
        <AlertDialog.Description>
          <div>This will permanently delete this expense.</div>
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <form action="?/delete" method="post" use:enhance={submitDelete}>
          <input type="hidden" name="id" value={expense.id}>
          <button type="submit">
            <AlertDialog.Action asChild let:builder>
              <Button builders={[builder]} variant="destructive">Delete</Button>
            </AlertDialog.Action>
          </button>
        </form>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</div>