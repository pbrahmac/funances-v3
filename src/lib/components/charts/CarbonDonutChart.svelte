<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { formatCurrency, prepExpensesForChart } from '$lib/utils';
	import { Alignments, DonutChart, type DonutChartOptions } from '@carbon/charts';
	import '@carbon/charts/styles.css';
	import type { RecordModel } from 'pocketbase';
	import { afterUpdate, onMount } from 'svelte';

	// props
	export let chartIdx: number;
	export let chartName: string;
	export let chartRawData: RecordModel[];
	export let chartEmptyText: string = 'Nothing to show.';

	$: chartData = prepExpensesForChart(chartRawData);
	let chart: DonutChart;
	onMount(async () => {
		let carbonData = chartData.values.map((val, idx) => ({
			group: chartData.labels.at(idx),
			value: val
		}));

		let carbonColors = new Map<string, string>();
		chartData.colors.forEach((color, idx) =>
			carbonColors.set(chartData.labels.at(idx) ?? '', color)
		);

		let carbonOptions: DonutChartOptions = {
			resizable: true,
			donut: {
				alignment: Alignments.CENTER,
				center: { numberFontSize: () => 0 }
			},
			color: { scale: Object.fromEntries(carbonColors.entries()) },
			legend: { enabled: false },
			toolbar: { enabled: false },
			tooltip: {
				valueFormatter: (val) => formatCurrency(val)
			},
			pie: { labels: { enabled: false } }
		};

		const chartContainer = document.getElementById(`chart-${chartIdx}`) as HTMLDivElement;
		chart = new DonutChart(chartContainer, { data: carbonData, options: carbonOptions });
	});

	afterUpdate(async () => {
		chart.model.setData(
			chartData.values.map((val, idx) => ({
				group: chartData.labels.at(idx),
				value: val
			}))
		);
		let carbonColors = new Map<string, string>();
		chartData.colors.forEach((color, idx) =>
			carbonColors.set(chartData.labels.at(idx) ?? '', color)
		);
		chart.model.setOptions({
			color: { scale: Object.fromEntries(carbonColors.entries()) }
		});
	});
</script>

<div>
	<Card.Root class="min-w-fit aspect-video">
		<Card.Header>
			<Card.Title class="text-center">{chartName}</Card.Title>
		</Card.Header>
		{#if chartData.values}
			<div id={`chart-${chartIdx}`} class="px-8 h-full" />
		{:else}
			<div class="text-muted-foreground text-sm">{chartEmptyText}</div>
		{/if}
		<Card.Footer />
	</Card.Root>
</div>
