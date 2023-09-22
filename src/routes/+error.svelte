<script>
	import { page } from '$app/stores';
	import { Separator } from '$lib/components/ui/separator';
</script>

<div class="fullPageContainer flex flex-col items-center justify-center space-y-6">
	<h1 class="text-6xl font-bold">{$page.status} - {$page.error?.message}</h1>
	<span
		>There's been an error. Go <a
			href="/"
			class="underline underline-offset-2 hover:underline-offset-4 transition-transform">home</a
		>?</span
	>
</div>
