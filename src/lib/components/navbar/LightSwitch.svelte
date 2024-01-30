<script lang="ts">
	import { cn } from '$lib/utils';
	import { Moon, Sun } from 'radix-icons-svelte';
	import { getContext, setContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	// types
	type OnKeyDownEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLDivElement;
	};

	// props
	// export let darkModeStore: Writable<boolean>;

	let darkModeStore: Writable<boolean> = getContext('darkModeStore');

	function onKeyDown(event: OnKeyDownEvent): void {
		if (['Enter', 'Space'].includes(event.code)) {
			event.preventDefault();
			event.currentTarget.click();
		}
	}

	const switchLightMode = () => {
		window.document.documentElement.classList.toggle('dark');
		$darkModeStore = !$darkModeStore;
		setContext('darkModeStore', darkModeStore);
	};
</script>

<div
	on:click={switchLightMode}
	on:keydown={onKeyDown}
	role="switch"
	aria-label="Light Switch"
	aria-checked="false"
	title="Toggle Dark Mode"
	tabindex="0"
>
	<div
		class={cn(
			'flex items-center justify-center w-10 h-10 rounded-md transition-colors hover:bg-secondary'
		)}
	>
		{#if $darkModeStore}
			<Sun class="h-5 w-5" />
			<span class="sr-only">Light</span>
		{:else}
			<Moon class="h-5 w-5" />
			<span class="sr-only">Dark</span>
		{/if}
	</div>
</div>
