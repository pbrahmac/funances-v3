<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import type { Expense } from '$lib/utils';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Pencil1, Trash } from 'radix-icons-svelte';
	import { toast } from 'svelte-sonner';
	import type { Writable } from 'svelte/store';

	export let expense: Expense;
	export let store: Writable<Expense[]>;

	const submitDelete: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				store.set($page.data.expenses?.items);
				toast.success('Expense deleted.');
			} else {
				toast.error('Something went wrong.');
			}
			await applyAction(result);
		};
	};
</script>

<div class="flex space-x-2 items-center justify-center">
	<!-- edit -->
	<Button variant="ghost" size="icon" class="w-8 h-8 p-0" href="/edit/expense/{expense.id}">
		<Pencil1 class="w-4 h-4" />
	</Button>

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
			<AlertDialog.Footer class="gap-y-2">
				<form action="?/delete" method="post" class="w-full" use:enhance={submitDelete}>
					<input type="hidden" name="id" value={expense.id} />
					<button type="submit" class="w-full lg:w-fit lg:float-right">
						<AlertDialog.Action asChild let:builder>
							<Button builders={[builder]} variant="destructive" class="w-full">Delete</Button>
						</AlertDialog.Action>
					</button>
				</form>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
