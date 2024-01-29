<script lang="ts">
	import { expensesToCategoryArrays, formatCurrency, formatPercentage } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate, getContext, onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import type { Writable } from 'svelte/store';

	// props
	export let chartIdx: number;
	export let chartName: string;
	export let chartRawData: RecordModel[];
	export let chartEmptyText = 'Nothing to show.';

	let isDarkMode: Writable<boolean> = getContext('darkModeStore');
	$: console.log($isDarkMode);

	$: chartData = expensesToCategoryArrays(chartRawData);
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
	afterUpdate(async () => {
		chart.setOption({
			darkMode: $isDarkMode,
			series: {
				data: chartData.values.map((val, idx) => ({
					value: val,
					name: chartData.labels.at(idx),
					itemStyle: { color: chartData.colors.at(idx) }
				})),
				itemStyle: { borderColor: $isDarkMode ? '#000' : '#fff' }
			}
		});
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
