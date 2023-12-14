<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	export let items: { href: string; title: string }[];
</script>

<nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
	{#each items as item}
		<Button
			href={item.href}
			variant="ghost"
			class={cn(
				$page.url.pathname === item.href
					? 'bg-muted hover:bg-muted'
					: 'hover:bg-transparent hover:underline',
				'justify-start'
			)}
		>
			{item.title}
		</Button>
	{/each}
</nav>
