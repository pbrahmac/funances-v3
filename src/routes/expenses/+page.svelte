<script lang="ts">
	import { writable } from 'svelte/store';
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';

	// props
	export let data: PageData;

	// initialize store for expense items
	let expensesStore = writable(data.expenses?.items);
</script>

<svelte:head>
	<title>Expenses</title>
</svelte:head>

<div class="fullPageContainer p-6">
	<DataTable
		expenses={expensesStore}
		addExpenseForm={data.addExpenseForm}
		categories={data.expenseTypes}
	/>
</div>
