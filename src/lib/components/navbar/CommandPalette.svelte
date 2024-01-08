<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Command from '$lib/components/ui/command';
	import {
		BadgeDollarSign,
		BadgePercent,
		Landmark,
		LayoutPanelLeft,
		TableProperties,
		UserCircle,
		WalletCards
	} from 'lucide-svelte';
	import type { BaseModel } from 'pocketbase';
	import { onMount } from 'svelte';

	// props
	export let user: BaseModel | undefined;

	// open state
	let open: boolean = false;

	// command palette objects
	const paletteItems = [
		{
			groupHeading: 'Pages',
			content: [
				{ href: '/', title: 'Dashboard', icon: LayoutPanelLeft },
				{ href: '/expenses', title: 'Expenses', icon: BadgeDollarSign },
				{ href: '/income', title: 'Incomes', icon: Landmark },
				{ href: '/allocations', title: 'Allocations', icon: BadgePercent }
			]
		},
		{
			groupHeading: 'Settings',
			content: [
				{ href: '/settings', title: 'Profile', icon: UserCircle },
				{ href: '/settings/allocations', title: 'Allocation Amounts', icon: TableProperties },
				{ href: '/settings/expense-categories', title: 'Expense Categories', icon: WalletCards }
			]
		}
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
		<Command.Empty>No results found.</Command.Empty>
		{#each paletteItems as group}
			<Command.Group heading={group.groupHeading}>
				{#each group.content as page}
					<Command.Item
						onSelect={() => {
							goto(page.href);
							open = !open;
						}}
					>
						{#if page.icon}
							<svelte:component this={page.icon} class="mr-2" />
						{/if}
						<span>{page.title}</span>
					</Command.Item>
				{/each}
			</Command.Group>
			<Command.Separator />
		{/each}
	</Command.List>
</Command.Dialog>
