<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Command from '$lib/components/ui/command';
	import { BadgeDollarSign, BadgePercent, Landmark, LayoutPanelLeft } from 'lucide-svelte';
	import type { BaseModel } from 'pocketbase';
	import { onMount } from 'svelte';

	// props
	export let user: BaseModel | undefined;

	// open state
	let open: boolean = false;

	// command items objects
	const pages = [
		{ href: '/', title: 'Dashboard', icon: LayoutPanelLeft },
		{ href: '/expenses', title: 'Expenses', icon: BadgeDollarSign },
		{ href: '/income', title: 'Incomes', icon: Landmark },
		{ href: '/allocations', title: 'Allocations', icon: BadgePercent }
	];

	// event listener for keyboard shortcut
	onMount(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}
		}

		if (user) {
			document.addEventListener('keydown', handleKeyDown);
			return () => {
				document.removeEventListener('keydown', handleKeyDown);
			};
		}
	});
</script>

<Command.Dialog bind:open>
	<Command.Input placeholder="Type a command..." />
	<Command.List>
		<Command.Empty>--</Command.Empty>
		<Command.Group heading="Pages">
			{#each pages as page}
				<Command.Item
					onSelect={() => {
						goto(page.href);
						open = !open;
					}}
				>
					<svelte:component this={page.icon} class="mr-2" />
					<span>{page.title}</span>
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
