<script lang="ts">
  import * as Table from '$lib/components/ui/table';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Sheet from '$lib/components/ui/sheet';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import AddExpenseForm from '$lib/components/AddExpenseForm.svelte';
  import DataTableActions from "./data-table-actions.svelte";
  import DataTableCheckbox from "./data-table-checkbox.svelte";
	import type { addExpenseSchema } from '$lib/schemas/addExpense';
	import { CategoryBadge } from "$lib";
	import { formatCurrency, formatDateNeat, type Expense, type ExpenseCategory } from "$lib/utils";
  import { createTable, createRender, Render, Subscribe } from "svelte-headless-table";
  import { addPagination, addSortBy, addTableFilter, addHiddenColumns, addSelectedRows } from "svelte-headless-table/plugins";
  import { CaretSort, ChevronDown } from "radix-icons-svelte";
	import type { Writable } from "svelte/store";
	import type { SuperValidated } from 'sveltekit-superforms';
  
  export let expenses: Writable<Expense[]>;
  export let form: SuperValidated<typeof addExpenseSchema>;
  export let categories: ExpenseCategory[];
  
  const table = createTable(expenses, {
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
      accessor: "id",
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
			header: 'Expense',
			accessor: (item: Expense) => item.expense
		}),
		table.column({
			header: 'Category',
			accessor: (item: Expense) => item.category,
			cell: ({ value }) => createRender(CategoryBadge, { name: value.name, color: value.color }),
			plugins: {
				sort: {
					getSortValue: (item: {name: string, color: string}) => item.name
				},
				filter: {
					getFilterValue: (item: {name: string, color: string}) => item.name
				}
			}
		}),
		table.column({
			header: 'Amount',
			accessor: (item) => `${formatCurrency(item.amount)}`,
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
			header: 'Notes',
			accessor: (item) => (item.notes.length > 0 ? item.notes : '--'),
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
    table.column({
      accessor: (expense) => expense,
      header: "",
      cell: (item) => { return createRender(DataTableActions, { expense: item.value, store: expenses }) }
    })
	]);
  
  const { headerRows, rows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, flatColumns } = table.createViewModel(columns);
  const { filterValue } = pluginStates.filter;
  const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;
  const { hiddenColumnIds } = pluginStates.hide;
  const { selectedDataIds } = pluginStates.select;

  const ids = flatColumns.map((col) => col.id);
  let hideForId = Object.fromEntries(ids.map((id) => [id, ['Notes'].includes(id) ? false : true]));

  $: $hiddenColumnIds = Object.entries(hideForId).filter(([, hide]) => !hide).map(([id]) => id);
  const hideableCols = ["Category", "Notes"];
</script>

<div>
  <div class="flex items-center py-4">
    <!-- searchbar -->
    <Input
      class="max-w-sm"
      placeholder="Search expenses..."
      type="text"
      bind:value={$filterValue}
    />
    <!-- column visibility -->
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button variant="outline" class="ml-auto" builders={[builder]}>
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
    <Dialog.Root>
      <Dialog.Trigger asChild let:builder>
        <Button builders={[builder]} variant="default" class="ml-2">Add Expense</Button>
      </Dialog.Trigger>
      <AddExpenseForm {form} {categories} store={expenses} />
    </Dialog.Root>
  </div>
  <div class="rounded-md border">
    <Table.Root {...$tableAttrs}>
      <Table.Header>
        {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
            <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
              <Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-3">
                {#if ['Date', 'Category', 'Amount'].includes(cell.id)}
                  {#if cell.id === "Amount"}
                    <div class="text-right">
                      <Button variant="ghost" on:click={props.sort.toggle}>
                        <Render of={cell.render()} />
                        <CaretSort class="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  {:else if cell.id === "Category"}
                  <div class="text-center">
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
                {:else if cell.id === "Notes"}
                  <div class="text-center">
                    <Render of={cell.render()} />
                  </div>
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
                    {#if cell.id === "Amount"}
                      <div class="text-right font-medium">
                        <Render of={cell.render()} />
                      </div>
                    {:else if cell.id === "Expense"}
                      <div class="capitalize">
                        <Render of={cell.render()} />
                      </div>
                    {:else if cell.id === "Category"}
                      <div class="text-center">
                        <Render of={cell.render()} />
                      </div>
                    {:else if cell.id === "Notes"}
                      <div class="text-right">
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
  <!-- <div class="flex items-center justify-end space-x-2 py-4">
    {#each Array(expenses?.totalPages) as _, idx}
      <a href="/expenses?limit={expenses?.perPage}&pageNum={idx+1}">{idx+1}</a>
    {/each}
  </div> -->
  <div class="flex items-center justify-end space-x-2 py-4">
    <div class="flex-1 text-sm text-muted-foreground">
      {Object.keys($selectedDataIds).length} of{" "}
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
    {
      $pageCount > 1 
        ?
        `Showing ${$pageSize} of ${$rows.length} entries.` 
        : 
        `Showing ${$rows.length} entries.`
    }
  </span>
</div>