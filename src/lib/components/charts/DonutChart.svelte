<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { formatCurrency, expensesToCategoryArrays } from '$lib/utils';
	import type { ApexOptions } from 'apexcharts';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate, onMount } from 'svelte';

	// props
	export let chartIdx: number;
	export let chartName: string;
	export let chartRawData: RecordModel[];
	export let chartEmptyText: string = 'Nothing to show.';

	$: chartData = expensesToCategoryArrays(chartRawData);
	let chart: ApexCharts;
	onMount(async () => {
		const ApexCharts = await import('apexcharts');

		let apexOptions: ApexOptions = {
			series: chartData.values,
			labels: chartData.labels,
			colors: chartData.colors,
			chart: {
				type: 'donut',
				fontFamily: 'Poppins'
			},
			legend: { show: false },
			stroke: { show: false },
			dataLabels: { enabled: false },
			states: { hover: { filter: { type: 'none' } } },
			noData: { text: chartEmptyText, style: { fontFamily: 'Poppins' } },
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
		await chart.render();
	});

	afterUpdate(async () => {
		await chart.updateSeries(chartData.values);
	});
</script>

<div>
	<Card.Root class="min-w-fit">
		<Card.Header>
			<Card.Title class="text-center">{chartName}</Card.Title>
		</Card.Header>
		<div id={`chart-${chartIdx}`} class="w-full" />
		<Card.Footer />
	</Card.Root>
</div>
