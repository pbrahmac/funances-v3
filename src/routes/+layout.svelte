<script lang="ts">
	import { ViewTransition } from '$lib';
	import { CommandPalette, Navbar } from '$lib/components/navbar';
	import { getContext, onMount, setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';
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

<div class="main">
	<ViewTransition />
	<Navbar user={data.user} />
	<CommandPalette user={data.user} />
	<slot />
</div>

<style>
	.main {
		min-height: 100svh;
	}
</style>
