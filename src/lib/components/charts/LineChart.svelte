<script lang="ts">
	import { expensesToMonthArrays, formatCurrency } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate, getContext, onDestroy, onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import type { Writable } from 'svelte/store';

	// props
	export let chartIdx: number;
	export let chartName: string;
	export let chartRawData: RecordModel[];
	export let chartEmptyText = 'Nothing to show.';

	let isDarkMode: Writable<boolean> = getContext('darkModeStore');

	$: chartData = expensesToMonthArrays(chartRawData);
	let chart: echarts.EChartsType;

	onMount(async () => {
		const echarts = await import('echarts');
		chart = echarts.init(document.getElementById(`chart-${chartIdx}`));

		let chartOptions: echarts.EChartsOption = {
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
							borderRadius: 4,
							padding: 4,
							formatter: (params) => `${params.name}\n${formatCurrency(params.value as number)}`
						}
					}
				}
			],
			xAxis: {
				data: chartData.months,
				show: false
			},
			yAxis: { splitLine: { show: false }, show: false }
		};
		chart.setOption(chartOptions);
	});

	afterUpdate(async () => {
		chart.setOption({
			darkMode: $isDarkMode,
			xAxis: {
				data: chartData.months
			},
			series: {
				data: chartData.values,
				emphasis: {
					label: {
						backgroundColor: $isDarkMode ? '#fff' : '#000',
						color: $isDarkMode ? '#000' : '#fff'
					}
				}
			}
		});
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
