<script lang="ts">
	import { page } from '$app/stores';
	import { AvatarComponent, LightSwitch, MobileNavbar } from '$lib/components/navbar';
	import { Separator } from '$lib/components/ui/separator';
	import type { MenuItem } from '$lib/utils';
	import type { BaseModel } from 'pocketbase';
	import type { Writable } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import { Search } from 'lucide-svelte';
	import { getContext } from 'svelte';

	// props
	export let user: BaseModel | undefined;

	// menu items
	const loggedInItems: MenuItem[] = [
		{ title: 'Dashboard', link: '/' },
		{ title: 'Expenses', link: '/expenses' },
		{ title: 'Income', link: '/income' },
		{ title: 'Allocations', link: '/allocations' }
	];
	const loggedOutItems: MenuItem[] = [
		{ title: 'Sign In', link: '/signin' },
		{ title: 'Sign Up', link: '/signup' }
	];
</script>

<!-- mobile -->
<MobileNavbar {user} {loggedInItems} {loggedOutItems} />

<!-- desktop -->
<nav class="hidden lg:flex items-center justify-between h-20 border-b-2 shadow-sm">
	<a
		href="/"
		class="ml-6 lowercase text-3xl font-semibold underline underline-offset-4 transition-all hover:underline-offset-8"
		>funances</a
	>

	<div class="h-10 flex items-center space-x-2 last:mr-4">
		<ul class="flex items-center justify-center text-muted-foreground">
			{#if user}
				{#each loggedInItems as item}
					<a
						class="ml-2 px-3 py-2 rounded text-sm transition-colors hover:bg-secondary"
						href={item.link}
						class:text-foreground={$page.url.pathname === item.link}
						class:bg-secondary={$page.url.pathname === item.link}
					>
						{item.title}
					</a>
				{/each}
			{:else}
				{#each loggedOutItems as item}
					<a
						class="ml-2 px-3 py-2 rounded text-sm transition-colors hover:bg-secondary"
						href={item.link}
						class:text-foreground={$page.url.pathname === item.link}
						class:bg-secondary={$page.url.pathname === item.link}
					>
						{item.title}
					</a>
				{/each}
			{/if}
		</ul>
		<Separator orientation="vertical" />
		<div class="flex items-center justify-center space-x-2 px-2">
			{#if user}
				<Button variant="secondary" disabled>
					<Search class="w-4 h-4 mr-1" />
					<kbd class="font-sans"> with ⌘K </kbd>
				</Button>
			{/if}
			<LightSwitch />
			{#if user}
				<AvatarComponent {user} />
			{/if}
		</div>
	</div>
</nav>
