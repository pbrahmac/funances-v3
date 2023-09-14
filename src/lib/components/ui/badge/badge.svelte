<script lang="ts">
	import { cn } from "$lib/utils";
	import { badgeVariants, type Variant } from ".";

	let className: string | undefined | null = undefined;
	export let href: string | undefined = undefined;
	export let variant: Variant = "default";
	export { className as class };
	export let style: string = "";
</script>

<svelte:element
	this={href ? "a" : "span"}
	{href}
	class={cn(badgeVariants({ variant, className }))}
	style={style}
	{...$$restProps}
>
	<slot />
</svelte:element>
