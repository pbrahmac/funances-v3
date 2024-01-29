<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { expensesToMonthArrays, formatCurrency } from '$lib/utils';
	import { AreaChart, ChartTheme, ScaleTypes, type AreaChartOptions } from '@carbon/charts';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate, onMount } from 'svelte';

	// props
	export let chartIdx: number;
	export let chartName: string;
	export let chartRawData: RecordModel[];
	export let chartEmptyText = 'Nothing to show.';

	$: chartData = expensesToMonthArrays(chartRawData);
	let chart: AreaChart;

	onMount(async () => {
		let carbonData = chartData.combined;

		let carbonOptions: AreaChartOptions = {
			resizable: true,
			color: { gradient: { enabled: true } },
			legend: { enabled: false },
			toolbar: { enabled: false },
			tooltip: {
				valueFormatter: (val, label) => (label === 'Amount' ? formatCurrency(val) : val),
				groupLabel: ''
			},
			grid: {
				x: { enabled: false },
				y: { enabled: false }
			},
			axes: {
				bottom: {
					visible: false,
					title: 'Month',
					mapsTo: 'month',
					scaleType: ScaleTypes.LABELS
				},
				left: {
					visible: false,
					title: 'Amount',
					mapsTo: 'value',
					scaleType: ScaleTypes.LINEAR
				}
			}
		};

		const chartContainer = document.getElementById(`chart-${chartIdx}`) as HTMLDivElement;
		chart = new AreaChart(chartContainer, { data: carbonData, options: carbonOptions });
	});

	afterUpdate(async () => {
		chart.model.setData(chartData.combined);
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
				class="px-8 h-full chart"
				class:hidden={chartData.values.length < 2}
			/>
			<div class="text-muted-foreground text-sm" class:hidden={chartData.values.length > 0}>
				{chartEmptyText}
			</div>
		</Card.Content>
		<Card.Footer />
	</Card.Root>
</div>
