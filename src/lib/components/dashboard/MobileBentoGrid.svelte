<script lang="ts">
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card';
	import type { RecordModel } from 'pocketbase';
	import { AverageExpenseCard, CategoryListCard } from '.';
	import { CarbonDonutChart } from '../charts';
	import { CategoryBadge } from '../misc';
	import { Badge } from '../ui/badge';
	import type { Writable } from 'svelte/store';

	// props
	export let expensesStore: Writable<RecordModel[]>;
</script>

<!-- mobile grid -->
<div class="md:hidden grid grid-cols-1 gap-2 justify-center justify-self-center w-full p-2">
	<div class="col-span-1">
		<CategoryListCard {expensesStore} title="Biggest Spenders" areBiggest={true} />
	</div>
	<div class="col-span-1">
		<CategoryListCard {expensesStore} title="Smallest Spenders" areBiggest={false} />
	</div>
	<div class="col-span-1">
		<AverageExpenseCard {expensesStore} title="Avg. Expense" />
	</div>
	<div class="col-span-full">
		<CarbonDonutChart
			chartIdx={1}
			chartName="Expenses by Category"
			chartRawData={$page.data.expenses}
		/>
	</div>
</div>
