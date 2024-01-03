<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from '../../../routes/$types';

	// props
	export let chartIdx: number;

	onMount(async () => {
		const FrappeCharts = await import('frappe-charts/dist/frappe-charts.esm');
		const data = {
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
					name: 'Some Data',
					type: 'bar',
					values: [25, 40, 30, 35, 8, 52, 17, -4]
				}
			]
		};
		const chart = new FrappeCharts.Chart(`#chart-${chartIdx}`, {
			title: 'Chart',
			data: data,
			type: 'axis-mixed',
			height: 250,
			colors: ['#7cd6fd', '#743ee2']
		});
	});
</script>

<div id={`chart-${chartIdx}`} />
