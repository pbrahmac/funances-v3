<script lang="ts">
	import { ViewTransition } from '$lib';
	import { CommandPalette, Navbar } from '$lib/components/navbar';
	import { Toaster } from '$lib/components/ui/sonner';
	import { createDarkModeStore } from '$lib/stores/darkMode';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import '../app.postcss';
	import type { LayoutData } from './$types';

	// props
	export let data: LayoutData;

	// dark mode toggle stuff
	let darkModeStore: Writable<boolean>;
	onMount(() => {
		const currentPreference =
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
		darkModeStore = createDarkModeStore(currentPreference);
		if (currentPreference) {
			document.documentElement.classList.add('dark');
			darkModeStore.set(true);
		} else {
			document.documentElement.classList.remove('dark');
			darkModeStore.set(false);
		}
	});
</script>

<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

<div class="main">
	<ViewTransition />
	<Navbar user={data.user} {darkModeStore} />
	<CommandPalette user={data.user} />
	<Toaster position="bottom-center" />
	<slot />
</div>

<style>
	.main {
		min-height: 100svh;
	}
</style>
