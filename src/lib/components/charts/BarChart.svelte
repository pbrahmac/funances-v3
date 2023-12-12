<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency, monthIdxToName, type ExpenseCategory } from '$lib/utils';
	import type { ApexOptions } from 'apexcharts';
	import { number } from 'zod';

	// props
	export let data: Map<string, number>;
	export let expenseTypes: ExpenseCategory[];
	export let chartIdx: number;
	export let sparkline: boolean = true;
	export let width: number = 500;

	const series = [...data.values()];
	const labels = [...data.keys()];
	const colors = labels.map((id) => expenseTypes.find((obj) => obj.id === id)?.color ?? '#000000');

	console.log(colors);

	onMount(async () => {
		const ApexCharts = await import('apexcharts');
		let options: ApexOptions = {
			chart: {
				type: 'bar',
				height: 240,
				// width: width,
				sparkline: {
					enabled: sparkline
				},
				toolbar: {
					show: false
				}
			},
			xaxis: {
				labels: {
					formatter: (item) => expenseTypes.find((obj) => obj.id === item)?.name ?? item
				}
			},
			// theme: {
			// 	mode: window.document.documentElement.classList.contains('dark') ? 'dark' : 'light'
			// },
			yaxis: {
				labels: {
					formatter: (item) => formatCurrency(item)
				}
			},
			grid: {
				show: false
			},
			dataLabels: {
				enabled: false
				// dropShadow: {
				// 	enabled: false
				// }
			},
			tooltip: {
				enabled: true,
				custom: (param: any) => {
					return (
						'<div class="py-1 px-2 bg-secondary">' +
						'<span class="text-sm">' +
						formatCurrency(param.series[param.seriesIndex][param.dataPointIndex]) +
						'</span>' +
						'</div>'
					);
				},
				y: {
					title: {
						formatter: (item) => expenseTypes.find((obj) => obj.id === item)?.name + ':'
					},
					formatter: (item) => formatCurrency(item)
				}
			},
			legend: {
				show: false
			},
			// stroke: {
			// 	show: false
			// },
			series: [{ name: 'series', data: series }],
			labels: labels,
			colors: colors
		};
		let chart = new ApexCharts.default(document.getElementById(`chart-${chartIdx}`), options);
		chart.render();
	});
</script>

<div id={`chart-${chartIdx}`} class="w-full" />
