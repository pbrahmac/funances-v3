<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import * as Tabs from '$lib/components/ui/tabs';
	import {
		AddExpenseCategory,
		CategoriesTable,
		DisableExpenseCategory,
		EditExpenseCategory
	} from '../index';
	import type { PageData } from './$types';

	// props
	export let data: PageData;

	// show disabled categories state
	let showDisabled = false;
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Expense Categories</h3>
		<p class="text-sm text-muted-foreground">Add, disable, or edit expense categories.</p>
	</div>
	<div class="flex items-center justify-center space-x-3">
		<Switch id="showDisabled" bind:checked={showDisabled} />
		<Label for="showDisabled">Show Disabled</Label>
	</div>
	<CategoriesTable categories={showDisabled ? data.unfilteredExpenseTypes : data.expenseTypes} />
	<Separator />
	<Tabs.Root value="edit" class="flex flex-col space-y-4">
		<Tabs.List class="self-center">
			<Tabs.Trigger value="add">Add</Tabs.Trigger>
			<Tabs.Trigger value="edit">Edit</Tabs.Trigger>
			<Tabs.Trigger value="disable">Disable</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="add">
			<AddExpenseCategory form={data.addExpenseCategoryForm} />
		</Tabs.Content>
		<Tabs.Content value="edit">
			<EditExpenseCategory
				categories={showDisabled ? data.unfilteredExpenseTypes : data.expenseTypes}
				form={data.editExpenseCategoryForm}
			/>
		</Tabs.Content>
		<Tabs.Content value="disable">
			<DisableExpenseCategory
				categories={data.expenseTypes}
				form={data.disableExpenseCategoryForm}
			/>
		</Tabs.Content>
	</Tabs.Root>
</div>
