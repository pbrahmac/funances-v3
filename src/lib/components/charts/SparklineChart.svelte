<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency, monthIdxToName } from '$lib/utils';

	// props
	export let data: number[] | undefined;
	export let chartIdx: number;
	export let color: string = '#0891b2';

	let options = {
		chart: {
			type: 'area',
			height: 50,
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
					'<span class="">' +
					`${monthIdxToName(param.dataPointIndex, 'short')} - ` +
					'</span>' +
					'<span class="text-sm">' +
					formatCurrency(param.series[param.seriesIndex][param.dataPointIndex]) +
					'</span>' +
					'</div>'
				);
			}
		},
		colors: [color],
		series: [{ name: 'series', data: data ?? [] }]
	};

	onMount(async () => {
		const ApexCharts = await import('apexcharts');
		let chart = new ApexCharts.default(document.getElementById(`chart-${chartIdx}`), options);
		chart.render();
	});
</script>

<div id={`chart-${chartIdx}`} />
