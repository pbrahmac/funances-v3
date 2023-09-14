<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Button } from '$lib/components/ui/button';
  import { DotsHorizontal, Trash } from "radix-icons-svelte";
	import type { Expense } from '$lib/utils';

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

<!-- <DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button variant="ghost" builders={[builder]} size="icon" class="relative w-8 h-8 p-0">
      <span class="sr-only">Open menu</span>
      <DotsHorizontal class="w-4 h-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Item>Edit</DropdownMenu.Item>
      <DropdownMenu.Item>
        <AlertDialog.Root>
          <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Are you sure you want to delete this expense?</AlertDialog.Title>
              <AlertDialog.Description>
                {id}
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
              <AlertDialog.Action>Delete</AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root> -->