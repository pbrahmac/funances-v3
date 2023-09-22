<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from '../../routes/$types';

	// props
	export let data: PageData;
	export let chartIdx: number;

	const chartData = {
		labels: [
			'12am-3am',
			'3am-6pm',
			'6am-9am',
			'9am-12am',
			'12pm-3pm',
			'3pm-6pm',
			'6pm-9pm',
			'9am-12am'
		],
		datasets: [
			{
				values: [25, 40, 30, 35, 8, 52, 17, -4]
			}
		]
	};

	onMount(async () => {
		const frappe = await import('frappe-charts/dist/frappe-charts.esm');
		const chart = new frappe.Chart(`#chart-${chartIdx}`, {
			data: chartData,
			type: 'line',
			axisOptions: {
				xAxisMode: 'tick',
				yAxisMode: 'tick',
				xIsSeries: true
			},
			lineOptions: {
				regionFill: 1,
				hideDots: 1,
				heatLine: 1
			}
		});
	});
</script>

<div id={`chart-${chartIdx}`} />

<style>
	.frappe-chart .x.axis {
		display: none;
	}
</style>
