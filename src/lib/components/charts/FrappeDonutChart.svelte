<script lang="ts">
	import { onMount } from 'svelte';
	import type { ApexOptions } from 'apexcharts';
	import * as Card from '$lib/components/ui/card';
	import { cn, formatCurrency } from '$lib/utils';

	// props
	export let chartIdx: number;
	export let chartName: string;
	export let chartData: { values: number[]; labels: string[]; colors: string[] };
	export let gridDimensionClasses: string = 'col-span-full';

	onMount(async () => {
		const FrappeCharts = await import('frappe-charts/dist/frappe-charts.esm');
		const ApexCharts = await import('apexcharts');

		let apexOptions: ApexOptions = {
			chart: {
				type: 'donut',
				fontFamily: 'Poppins'
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

		let chart = new ApexCharts.default(document.getElementById(`chart-${chartIdx}`), apexOptions);
		chart.render();

		const data = {
			labels: chartData.labels,
			datasets: [
				{
					name: 'Donut',
					values: chartData.values
				}
			]
		};
		// new FrappeCharts.Chart(`#chart-${chartIdx}`, {
		// 	title: chartName,
		// 	data: data,
		// 	type: 'donut',
		// 	colors: chartData.colors
		// });
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
