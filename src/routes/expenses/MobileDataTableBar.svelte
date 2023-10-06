<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Form from '$lib/components/ui/form';
	import * as Table from '$lib/components/ui/table';
	import type { Writable } from 'svelte/store';
	import { page } from '$app/stores';
	import { dateWindowSchemaMaker } from '$lib/schemas/dateWindowSchema';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';
	import { ChevronDown } from 'radix-icons-svelte';
	import AddExpenseForm from '$lib/components/forms/AddExpenseForm.svelte';
	import { formatDateNeat, type Expense, formatCurrency, type ExpenseCategory } from '$lib/utils';
	import type { addExpenseSchema } from '$lib/schemas/addExpense';
	import type { SuperValidated } from 'sveltekit-superforms';

	// props
	export let filterValue: Writable<string>;
	export let rowsTotal: string;
	export let form: any;
	export let submitUpdateWindow: SubmitFunction;
	export let submitBatchDelete: SubmitFunction;
	export let flatColumns: any;
	export let hideableCols: string[];
	export let hideForId: any;
	export let selectedDataIds: Writable<Record<string, boolean>>;
	export let expenses: Writable<Expense[]>;
	export let addExpenseForm: SuperValidated<typeof addExpenseSchema>;
	export let categories: ExpenseCategory[];
</script>

<div class="grid grid-cols-1 gap-3 lg:hidden items-center py-4">
	<div class="flex items-center justify-center w-full">
		<!-- searchbar -->
		<Input
			class="max-w-sm"
			placeholder="Search expenses..."
			type="text"
			bind:value={$filterValue}
		/>
		<!-- total amount -->
		<div class="bg-secondary rounded-full py-2 px-3 text-sm font-medium ml-2">{rowsTotal}</div>
	</div>
	<div class="flex items-center justify-center w-full">
		<!-- date window -->
		<Form.Root
			form={$page.data.dateWindowForm}
			schema={dateWindowSchemaMaker($page.data.dateWindow.from, $page.data.dateWindow.to)}
			let:config
			asChild
		>
			<form
				bind:this={form}
				action="?/updateWindow"
				method="post"
				class="flex items-center justify-center space-x-2 ml-2"
				use:enhance={submitUpdateWindow}
			>
				<Form.Field {config} name="fromDatePicker">
					<Form.Item>
						<Form.Input type="date" on:change={() => form.requestSubmit()} />
					</Form.Item>
				</Form.Field>
				<p>-</p>
				<Form.Field {config} name="toDatePicker">
					<Form.Item>
						<Form.Input type="date" on:change={() => form.requestSubmit()} />
					</Form.Item>
				</Form.Field>
			</form>
		</Form.Root>
	</div>
	<div class="flex items-center justify-center space-x-4 w-full">
		<!-- column visibility -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" builders={[builder]}>
					Columns <span class="ml-2 w-4 h-4"><ChevronDown /></span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each flatColumns as col}
					{#if hideableCols.includes(col.id)}
						<DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
							{col.header}
						</DropdownMenu.CheckboxItem>
					{/if}
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<!-- batch delete -->
		<AlertDialog.Root>
			<AlertDialog.Trigger asChild let:builder>
				{@const selectedLength = Object.keys($selectedDataIds).length}
				<Button builders={[builder]} variant="secondary" disabled={selectedLength == 0}
					>{`Batch Delete (${selectedLength})`}</Button
				>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Are you sure?</AlertDialog.Title>
				</AlertDialog.Header>
				<Table.Root>
					<Table.Caption>These expenses will be deleted.</Table.Caption>
					<Table.Header>
						<Table.Row>
							<Table.Head>Date</Table.Head>
							<Table.Head class="text-center">Expense</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each $expenses as expense, idx}
							{#if Object.keys($selectedDataIds).includes(idx.toString())}
								<Table.Row>
									<Table.Cell>{formatDateNeat(expense.date, true)}</Table.Cell>
									<Table.Cell class="text-center">{expense.expense}</Table.Cell>
									<Table.Cell class="text-right">{formatCurrency(expense.amount)}</Table.Cell>
								</Table.Row>
							{/if}
						{/each}
					</Table.Body>
				</Table.Root>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<form action="?/batchDelete" method="post" use:enhance={submitBatchDelete}>
						{#each $expenses as expense, idx}
							{#if Object.keys($selectedDataIds).includes(idx.toString())}
								<input type="hidden" name={idx.toString()} value={expense.id} />
							{/if}
						{/each}
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
	<div class="flex items-center justify-center w-full">
		<!-- add expense -->
		<Dialog.Root>
			<Dialog.Trigger asChild let:builder>
				<Button builders={[builder]} variant="default" class="">Add Expense</Button>
			</Dialog.Trigger>
			<AddExpenseForm form={addExpenseForm} {categories} store={expenses} />
		</Dialog.Root>
	</div>
</div>
<Separator class="mb-4" />
