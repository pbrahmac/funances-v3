<script lang="ts">
	import type { PageData } from "./$types";
  import DataTable from "./data-table.svelte";
	import { writable } from "svelte/store";
  
  // props
  export let data: PageData;
  
  // initialize store for expense items
  let incomesStore = writable(data.incomes?.items);
</script>

<div class="fullPageContainer p-6">
  <DataTable incomes={incomesStore} addIncomeForm={data.addIncomeForm} />
</div>

