<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { BaseModel } from 'pocketbase';
	import type { Writable } from 'svelte/store';
	import { page } from '$app/stores';
	import AvatarComponent from './AvatarComponent.svelte';
	import LightSwitch from './LightSwitch.svelte';
	import MobileNavbar from './MobileNavbar.svelte';
	import type { MenuItem } from '$lib/utils';

	// props
	export let darkModeStore: Writable<boolean>;
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
<MobileNavbar {user} {loggedInItems} {loggedOutItems} {darkModeStore} />

<!-- desktop -->
<nav class="h-20 hidden lg:flex items-center justify-between border-b-2 shadow-sm">
	<a
		href="/"
		class="ml-6 lowercase text-3xl font-semibold underline underline-offset-4 transition-all hover:underline-offset-8"
		>funances</a
	>

	<div class="h-10 flex items-center space-x-2 last:mr-4">
		<ul class="flex items-center justify-center">
			{#if user}
				{#each loggedInItems as item}
					<a
						class="ml-2 px-3 py-2 rounded text-sm text-muted-foreground transition-colors hover:bg-secondary"
						href={item.link}
						aria-current={$page.url.pathname === item.link ? 'page' : undefined}
					>
						{item.title}
					</a>
				{/each}
			{:else}
				{#each loggedOutItems as item}
					<a
						class="ml-2 px-3 py-2 rounded text-sm text-muted-foreground transition-colors hover:bg-secondary"
						href={item.link}
						aria-current={$page.url.pathname === item.link ? 'page' : undefined}
					>
						{item.title}
					</a>
				{/each}
			{/if}
		</ul>
		<Separator orientation="vertical" />
		{#if user}
			<div class="px-3 h-full">
				<AvatarComponent {user} />
			</div>
		{/if}
		<LightSwitch {darkModeStore} />
	</div>
</nav>

<style>
	a[aria-current='page'] {
		@apply bg-secondary text-foreground;
	}
</style>
