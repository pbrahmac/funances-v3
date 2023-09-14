<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import { Button } from '$lib/components/ui/button';
  import { Trash } from "radix-icons-svelte";
	import type { Expense } from '$lib/utils';
	import type { Writable } from 'svelte/store';

  export let expense: Expense;
</script>

<div class="flex space-x-2 items-center justify-center">
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
        <form action="?/delete" method="post">
          <input type="hidden" name="id" value={expense.id}>
          <button type="submit">
            <AlertDialog.Action>Delete</AlertDialog.Action>
          </button>
        </form>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</div>