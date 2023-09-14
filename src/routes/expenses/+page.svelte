<script lang="ts">
	import type { PageData } from "./$types";
  import DataTable from "./data-table.svelte";
  import { Separator } from "$lib/components/ui/separator";
	import { writable, type Writable } from "svelte/store";
	import type { Expense } from "$lib/utils";
  
  // props
  export let data: PageData;
  
  const form = data.form;

  const expensesStore: Writable<Expense[]> = writable(data.expenses?.items);

  $expensesStore = data.expenses?.items || [];
</script>

<div class="fullPageContainer p-6">
  <h2 class="text-6xl mb-8">{`Hello, ${data?.user?.firstName} ${data?.user?.lastName}.`}</h2>
  <p class="text-2xl text-muted-foreground">This is the expenses page.</p>
  <Separator class="my-4" />
  <DataTable expenses={expensesStore} {form} categories={data.expenseTypes} />
</div>

