<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { AddIncomeForm, DateRangeForm } from '$lib/components/forms';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import type { addIncomeSchema } from '$lib/schemas/addIncome';
	import { formatCurrency, formatDateNeat, type Income } from '$lib/utils';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { CaretSort, ChevronDown } from 'radix-icons-svelte';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import {
		addHiddenColumns,
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import type { Writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';
	import PaycheckBadge from './PaycheckBadge.svelte';
	import DataTableActions from './data-table-actions.svelte';
	import DataTableCheckbox from './data-table-checkbox.svelte';

	export let incomes: Writable<Income[]>;
	export let addIncomeForm: SuperValidated<typeof addIncomeSchema>;

	// on change form submission variable
	let form: any;

	const table = createTable(incomes, {
		page: addPagination(),
		sort: addSortBy(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		hide: addHiddenColumns(),
		select: addSelectedRows()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'id',
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, { checked: allPageRowsSelected });
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);
				return createRender(DataTableCheckbox, { checked: isSelected });
			}
		}),
		table.column({
			header: 'Date',
			accessor: (item) => formatDateNeat(new Date(item.date), true),
			plugins: {
				sort: {
					getSortValue: (item: string) => new Date(item).getTime()
				},
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			header: 'Income',
			accessor: (item) => item.income
		}),
		table.column({
			header: 'Notes',
			accessor: (item) => (item.notes.length > 0 ? item.notes : '—'),
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			header: 'Paycheck',
			accessor: (item) => item.is_paycheck,
			cell: (item) => {
				return createRender(PaycheckBadge, { is_paycheck: item.value });
			},
			plugins: {
				sort: {
					getSortValue: (item) => item
				}
			}
		}),
		table.column({
			header: 'Amount',
			accessor: (item) =>
				`${formatCurrency(
					item.gross_amount - (item.taxes + item.retirement_401k + item.benefits)
				)}`,
			plugins: {
				sort: {
					getSortValue: (item: string) => parseFloat(item.slice(1).replaceAll(',', ''))
				},
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: (income) => income,
			header: '',
			cell: (item) => {
				return createRender(DataTableActions, {
					income: item.value,
					store: incomes
				});
			}
		})
	]);

	const { headerRows, rows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, flatColumns } =
		table.createViewModel(columns);
	const { filterValue } = pluginStates.filter;
	const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;
	const { hiddenColumnIds } = pluginStates.hide;
	const { selectedDataIds } = pluginStates.select;

	const ids = flatColumns.map((col) => col.id);
	let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);
	const hideableCols = ['Notes', 'Paycheck'];

	$: rowsTotal = formatCurrency(
		$rows.reduce(
			(sum, row) =>
				sum +
				parseFloat(
					(row.cells.at(-2) ?? row.cells[4]).render().toString().slice(1).replaceAll(',', '')
				),
			0
		)
	);

	// form enhance
	const submitBatchDelete: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				selectedDataIds.clear();
				await invalidateAll();
				incomes.set($page.data.incomes?.items);
			}
			await applyAction(result);
		};
	};

	const submitUpdateWindow: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				incomes.set($page.data.incomes?.items);
			}
			await applyAction(result);
		};
	};
</script>

<div>
	<div class="grid grid-cols-1 gap-3 lg:gap-2 lg:flex items-center justify-center w-full py-4">
		<div class="flex items-center justify-center w-full lg:max-w-lg">
			<!-- searchbar -->
			<Input
				class="max-w-sm"
				placeholder="Search incomes..."
				type="text"
				bind:value={$filterValue}
			/>
			<!-- total amount -->
			<div class="bg-secondary rounded-full py-2 px-3 text-sm font-medium ml-2">{rowsTotal}</div>
		</div>
		<Separator orientation="vertical" class="hidden lg:flex h-8 mr-1" />
		<!-- date window -->
		<DateRangeForm
			form={$page.data.dateRangeForm}
			formAction="?/updateWindow"
			submitFunction={submitUpdateWindow}
		/>
		<div class="flex items-center justify-center">
			<!-- column visibility -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button variant="outline" class="lg:ml-auto" builders={[builder]}>
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
					<Button
						builders={[builder]}
						variant="secondary"
						class="ml-2"
						disabled={selectedLength == 0}>{`Batch Delete (${selectedLength})`}</Button
					>
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you sure?</AlertDialog.Title>
					</AlertDialog.Header>
					<Table.Root>
						<Table.Caption>These incomes will be deleted.</Table.Caption>
						<Table.Header>
							<Table.Row>
								<Table.Head>Date</Table.Head>
								<Table.Head class="text-center">Income</Table.Head>
								<Table.Head class="text-right">Amount</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each $incomes as income, idx}
								{#if Object.keys($selectedDataIds).includes(idx.toString())}
									<Table.Row>
										<Table.Cell>{formatDateNeat(income.date, true)}</Table.Cell>
										<Table.Cell class="text-center">{income.income}</Table.Cell>
										<Table.Cell class="text-right"
											>{formatCurrency(
												income.gross_amount -
													(income.taxes + income.retirement_401k + income.benefits)
											)}</Table.Cell
										>
									</Table.Row>
								{/if}
							{/each}
						</Table.Body>
					</Table.Root>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						<form action="?/batchDelete" method="post" use:enhance={submitBatchDelete}>
							{#each $incomes as income, idx}
								{#if Object.keys($selectedDataIds).includes(idx.toString())}
									<input type="hidden" name={idx.toString()} value={income.id} />
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
		<div class="flex items-center justify-center">
			<!-- add income -->
			<AddIncomeForm form={addIncomeForm} store={incomes} />
		</div>
	</div>
	<!-- data table -->
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
										{#if ['Date', 'Amount', 'Paycheck'].includes(cell.id)}
											{#if cell.id === 'Amount'}
												<div class="text-right">
													<Button variant="ghost" on:click={props.sort.toggle}>
														<Render of={cell.render()} />
														<CaretSort class="ml-2 h-4 w-4" />
													</Button>
												</div>
											{:else}
												<Button variant="ghost" on:click={props.sort.toggle}>
													<Render of={cell.render()} />
													<CaretSort class="ml-2 h-4 w-4" />
												</Button>
											{/if}
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs} class="[&:has([role=checkbox])]:pl-3">
										{#if cell.id === 'Amount'}
											<div class="text-right font-medium">
												<Render of={cell.render()} />
											</div>
										{:else if cell.id === 'Income'}
											<div class="capitalize">
												<Render of={cell.render()} />
											</div>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{Object.keys($selectedDataIds).length} of{' '}
			{$rows.length} row(s) selected.
		</div>
		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex - 1)}
			disabled={!$hasPreviousPage}
		>
			Previous
		</Button>
		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex + 1)}
			disabled={!$hasNextPage}
		>
			Next
		</Button>
	</div>
	<span class="flex items-center justify-end text-sm text-muted-foreground">
		{$pageCount > 1
			? `Showing ${$pageRows.length} of ${$rows.length} entries.`
			: `Showing ${$rows.length} entries.`}
	</span>
</div>
