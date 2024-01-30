<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { expensesToMonthArrays, formatCurrency } from '$lib/utils';
	import type { EChartsOption } from 'echarts/types/dist/shared';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate, getContext, onDestroy } from 'svelte';
	import { watch, windowSizeStore } from 'svelte-legos';
	import type { Writable } from 'svelte/store';

	// props
	export let chartIdx: number;
	export let chartName: string;
	export let chartRawData: RecordModel[];
	export let chartEmptyText = 'Nothing to show.';

	let isDarkMode: Writable<boolean> = getContext('darkModeStore');

	$: chartData = expensesToMonthArrays(chartRawData);
	let chart: any;

	afterUpdate(async () => {
		// import echarts in a tree shakeable way
		const echarts = await import('echarts/core');
		const { LineChart } = await import('echarts/charts');
		const { DatasetComponent, GridComponent, TransformComponent } = await import(
			'echarts/components'
		);
		const { LabelLayout, UniversalTransition } = await import('echarts/features');
		const { SVGRenderer } = await import('echarts/renderers');
		echarts.use([
			LineChart,
			DatasetComponent,
			GridComponent,
			TransformComponent,
			LabelLayout,
			UniversalTransition,
			SVGRenderer
		]);

		const checkForChart = echarts.getInstanceByDom(
			document.getElementById(`chart-${chartIdx}`) as HTMLElement
		);
		if (checkForChart === undefined) {
			chart = echarts.init(document.getElementById(`chart-${chartIdx}`));
		} else {
			chart = checkForChart;
		}

		let chartOptions: EChartsOption = {
			legend: { show: false },
			darkMode: $isDarkMode,
			series: [
				{
					name: chartName,
					type: 'line',
					data: chartData.values,
					symbol: 'circle',
					symbolSize: 6,
					color: '#f97316',
					areaStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#fb923c' },
							{ offset: 1, color: '#fb923c00' }
						])
					},
					emphasis: {
						label: {
							show: true,
							backgroundColor: $isDarkMode ? '#fff' : '#000',
							color: $isDarkMode ? '#000' : '#fff',
							borderRadius: 6,
							padding: [5, 7, 5, 7],
							formatter: (params) =>
								`${params.name.replace('-', ' ')} - ${formatCurrency(params.value as number)}`,
							fontFamily: 'Poppins',
							fontWeight: 600
						}
					}
				}
			],
			xAxis: { data: chartData.months, show: false },
			yAxis: { show: false }
		};
		chart.setOption(chartOptions);
	});

	// resize chart reactively
	watch(windowSizeStore(), () => {
		chart.resize();
	});

	onDestroy(async () => {
		chart.dispose();
	});
</script>

<div>
	<Card.Root class="w-full h-full aspect-video">
		<Card.Header>
			<Card.Title class="text-center">{chartName}</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col items-center justify-center p-0 h-full">
			<div
				id={`chart-${chartIdx}`}
				class="w-full h-full"
				class:hidden={chartData.values.length < 1}
			/>
			<div class="text-muted-foreground text-sm" class:hidden={chartData.values.length > 0}>
				{chartEmptyText}
			</div>
		</Card.Content>
		<Card.Footer />
	</Card.Root>
</div>
