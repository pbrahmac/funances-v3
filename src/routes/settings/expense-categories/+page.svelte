<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { CategoriesTable, EditExpenseCategory } from '../index';
	import type { PageData } from './$types';
	import * as Tabs from '$lib/components/ui/tabs';

	export let data: PageData;
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Expense Categories</h3>
		<p class="text-sm text-muted-foreground">Add, remove, or edit expense categories.</p>
	</div>
	<CategoriesTable categories={data.expense_types} />
	<Separator />
	<Tabs.Root value="edit" class="flex flex-col space-y-4">
		<Tabs.List class="self-center">
			<Tabs.Trigger value="add">Add</Tabs.Trigger>
			<Tabs.Trigger value="edit">Edit</Tabs.Trigger>
			<Tabs.Trigger value="delete">Delete</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="add">Add</Tabs.Content>
		<Tabs.Content value="edit">
			<EditExpenseCategory categories={data.expense_types} form={data.editExpenseCategoryForm} />
		</Tabs.Content>
		<Tabs.Content value="delete">Delete</Tabs.Content>
	</Tabs.Root>
</div>
