<script lang="ts">
	import { afterUpdate } from 'svelte';
	import type { ApexOptions } from 'apexcharts';
	import * as Card from '$lib/components/ui/card';
	import { cn, formatCurrency, prepExpensesForChart } from '$lib/utils';
	import type { Writable } from 'svelte/store';
	import type { RecordModel } from 'pocketbase';
	import { page } from '$app/stores';

	// props
	export let chartIdx: number;
	export let chartName: string;
	export let gridDimensionClasses: string = 'col-span-full';

	$: chartData = prepExpensesForChart($page.data.expenses);
	let chart: ApexCharts;
	afterUpdate(async () => {
		// const FrappeCharts = await import('frappe-charts/dist/frappe-charts.esm');
		const ApexCharts = await import('apexcharts');

		let apexOptions: ApexOptions = {
			chart: {
				type: 'donut',
				fontFamily: 'Poppins'
				// animations: { dynamicAnimation: { enabled: false } }
			},
			series: chartData.values,
			labels: chartData.labels,
			colors: chartData.colors,
			legend: { show: false },
			stroke: { show: false },
			dataLabels: { enabled: false },
			states: { hover: { filter: { type: 'none' } } },
			tooltip: {
				fillSeriesColor: false,
				followCursor: false,
				y: { formatter: (value) => formatCurrency(value) }
			},
			plotOptions: {
				pie: { donut: { size: '80%' } }
			}
		};

		chart = new ApexCharts.default(document.getElementById(`chart-${chartIdx}`), apexOptions);
		chart.render();
		chart.updateSeries(chartData.values);
	});
</script>

<div class={cn(gridDimensionClasses)}>
	<Card.Root class="min-w-fit">
		<Card.Header>
			<Card.Title class="text-center">{chartName}</Card.Title>
		</Card.Header>
		<div id={`chart-${chartIdx}`} class="w-full" />
		<Card.Footer />
	</Card.Root>
</div>
