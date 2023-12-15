<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	export let items: { href: string; title: string }[];
</script>

<nav
	class="flex flex-wrap justify-center lg:justify-start space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1"
>
	{#each items as item}
		<Button
			href={item.href}
			variant="ghost"
			class={cn(
				$page.url.pathname === item.href
					? 'bg-secondary hover:bg-secondary'
					: 'hover:bg-transparent hover:underline',
				'justify-start'
			)}
		>
			{item.title}
		</Button>
	{/each}
</nav>
