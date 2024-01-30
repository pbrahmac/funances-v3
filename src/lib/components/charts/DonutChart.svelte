<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { expensesToCategoryArrays, formatCurrency, formatPercentage } from '$lib/utils';
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

	$: chartData = expensesToCategoryArrays(chartRawData);
	let chart: any;
	afterUpdate(async () => {
		// import echarts in a tree shakeable way
		const echarts = await import('echarts/core');
		const { PieChart } = await import('echarts/charts');
		const { DatasetComponent, TransformComponent } = await import('echarts/components');
		const { LabelLayout, UniversalTransition } = await import('echarts/features');
		const { SVGRenderer } = await import('echarts/renderers');
		echarts.use([
			PieChart,
			DatasetComponent,
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
					type: 'pie',
					data: chartData.values.map((val, idx) => ({
						value: val,
						name: chartData.labels.at(idx),
						itemStyle: { color: chartData.colors.at(idx) }
					})),
					radius: ['70%', '90%'],
					avoidLabelOverlap: false,
					itemStyle: {
						borderRadius: 5,
						borderColor: $isDarkMode ? '#000' : '#fff',
						borderWidth: 2
					},
					label: { show: false, position: 'center' },
					emphasis: {
						label: {
							show: true,
							fontFamily: 'Poppins',
							formatter: (params) =>
								`${params.name}\n${formatCurrency(params.value as number)} | ${formatPercentage(
									(params.percent as number) / 100
								)}`
						}
					},
					labelLine: { show: false }
				}
			]
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
