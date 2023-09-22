<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from '../../routes/$types';
	import { formatCurrency } from '$lib/utils';

	// props
	export let data: PageData;
	export let chartIdx: number;
	export let color: string;

	let options = {
		chart: {
			type: 'area',
			sparkline: {
				enabled: true
			},
			toolbar: {
				show: false
			}
		},
		tooltip: {
			enabled: true,
			custom: (param: any) => {
				return (
					'<div class="p-2 bg-secondary">' +
					'<span class="text-sm">' +
					formatCurrency(param.series[param.seriesIndex][param.dataPointIndex]) +
					'</span>' +
					'</div>'
				);
			}
		},
		colors: [color],
		series: [{ data: data.monthlyTotalExpenses ?? [] }]
	};

	onMount(async () => {
		const ApexCharts = await import('apexcharts');
		let chart = new ApexCharts.default(document.getElementById(`chart-${chartIdx}`), options);
		chart.render();
	});
</script>

<div id={`chart-${chartIdx}`} />
