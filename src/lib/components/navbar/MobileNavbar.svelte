<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import type { MenuItem } from '$lib/utils';
	import type { BaseModel } from 'pocketbase';
	import { Cross1, HamburgerMenu } from 'radix-icons-svelte';
	import type { Writable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import LightSwitch from './LightSwitch.svelte';

	// props
	export let user: BaseModel | undefined;
	export let darkModeStore: Writable<boolean>;
	export let loggedInItems: MenuItem[];
	export let loggedOutItems: MenuItem[];

	$: isMenuOpen = false;
</script>

<nav
	class="w-screen h-16 flex items-center justify-between lg:hidden"
	class:border-b-2={!isMenuOpen}
	class:shadow-sm={!isMenuOpen}
>
	<a
		href="/"
		class="ml-6 lowercase text-xl font-semibold underline underline-offset-4 transition-all hover:underline-offset-8"
		>funances</a
	>
	<div class="flex items-center space-x-2 last:mr-6">
		<LightSwitch {darkModeStore} />
		<Button variant="ghost" size="sm" on:click={() => (isMenuOpen = !isMenuOpen)}>
			{#if isMenuOpen}
				<Cross1 class="h-5 w-5" />
			{:else}
				<HamburgerMenu class="h-5 w-5" />
			{/if}
			<span class="sr-only">Hamburger Menu</span>
		</Button>
	</div>
</nav>
{#if isMenuOpen}
	<ul
		class="py-4 flex flex-col space-y-2 justify-center items-center border-b-2 shadow-sm"
		transition:slide
	>
		{#if user}
			{#each loggedInItems as item}
				<li>
					<Button on:click={() => (isMenuOpen = !isMenuOpen)} variant="link" href={item.link}
						>{item.title}</Button
					>
				</li>
			{/each}
			<div class="w-full flex items-center justify-center space-x-2">
				<Button href="/settings" variant="link" on:click={() => (isMenuOpen = !isMenuOpen)}
					>Settings</Button
				>
				<Separator orientation="vertical" class="h-8" />
				<form action="/logout" method="post">
					<Button type="submit" variant="link" on:click={() => (isMenuOpen = !isMenuOpen)}
						>Log Out</Button
					>
				</form>
			</div>
		{:else}
			{#each loggedOutItems as item}
				<li>
					<Button on:click={() => (isMenuOpen = !isMenuOpen)} variant="link" href={item.link}
						>{item.title}</Button
					>
				</li>
			{/each}
		{/if}
	</ul>
{/if}
