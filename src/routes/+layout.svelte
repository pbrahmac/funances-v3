<script lang="ts">
	import { Navbar, ViewTransition } from '$lib';
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

<div class="main">
	<ViewTransition />
	<Navbar user={data.user} {darkModeStore} />
	<slot />
</div>

<style>
	.main {
		min-height: 100svh;
	}
</style>
