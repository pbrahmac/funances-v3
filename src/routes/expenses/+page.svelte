<script lang="ts">
	import type { PageData } from "./$types";
  import DataTable from "./data-table.svelte";
	import { writable } from "svelte/store";
  
  // props
  export let data: PageData;
  
  // initialize store for expense items
  let expensesStore = writable(data.expenses?.items);
</script>

<div class="fullPageContainer p-6">
  <DataTable expenses={expensesStore} addExpenseForm={data.addExpenseForm} editExpenseForm={data.editExpenseForm} categories={data.expenseTypes} />
</div>

