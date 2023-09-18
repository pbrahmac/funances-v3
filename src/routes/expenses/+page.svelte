<script lang="ts">
	import type { PageData, SubmitFunction } from "./$types";
  import DataTable from "./data-table.svelte";
  import * as Card from '$lib/components/ui/card';
  import * as Form from '$lib/components/ui/form';
	import { writable } from "svelte/store";
	import { dateWindowSchemaMaker } from "$lib/schemas/dateWindowSchema";
	import { applyAction, enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
  
  // props
  export let data: PageData;
  
  // initialize store for expense items
  let expensesStore = writable(data.expenses?.items);
</script>

<div class="fullPageContainer p-6">
  <DataTable expenses={expensesStore} addExpenseForm={data.addExpenseForm} categories={data.expenseTypes} />
</div>

