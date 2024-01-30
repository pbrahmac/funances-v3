<script lang="ts">
	import { ViewTransition } from '$lib';
	import { CommandPalette, Navbar } from '$lib/components/navbar';
	import { getContext, onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.postcss';
	import type { LayoutData } from './$types';

	// props
	export let data: LayoutData;

	// dark mode toggle stuff
	let darkModeStore: Writable<boolean> = writable(true);
	setContext('darkModeStore', darkModeStore);
	onMount(() => {
		const currentPreference =
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
		if (currentPreference) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		$darkModeStore = currentPreference;
	});
</script>

<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

<div class="main">
	<ViewTransition />
	<Navbar user={data.user} />
	<CommandPalette user={data.user} />
	<Toaster position="bottom-center" />
	<slot />
</div>

<style>
	.main {
		min-height: 100svh;
	}
</style>
