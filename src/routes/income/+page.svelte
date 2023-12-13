<script lang="ts">
	import { writable } from 'svelte/store';
	import type { PageData } from './$types';
	import DataTable from './data-table.svelte';

	// props
	export let data: PageData;

	// initialize store for expense items
	let incomesStore = writable(data.incomes?.items);
</script>

<svelte:head>
	<title>Income</title>
</svelte:head>

<div class="fullPageContainer p-6">
	<DataTable incomes={incomesStore} addIncomeForm={data.addIncomeForm} />
</div>
