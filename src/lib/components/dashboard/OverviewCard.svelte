<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	// props
	export let title: string;
	export let icon: any;
	export let amount: string;
	export let subtext: string;
</script>

<!-- desktop -->
<Card.Root class="flex flex-col overflow-hidden w-80">
	<Card.Header>
		<div class="flex items-center justify-between space-x-4">
			<Card.Title class="text-lg font-medium">{title}</Card.Title>
			<svelte:component this={icon} class="w-5 h-5 p-0" />
		</div>
	</Card.Header>
	<Card.Content>
		<h2 class="text-3xl font-bold tracking-wide">{amount}</h2>
		<p class="text-muted-foreground text-sm">{subtext}</p>
	</Card.Content>
</Card.Root>
