<script lang="ts">
	import type { PageData } from './$types';

	// props
	export let data: PageData;
</script>

<div class="fullPageContainer p-6">
	<h2 class="text-6xl mb-8">{`Hello, ${data?.user?.firstName} ${data?.user?.lastName}.`}</h2>
	<p class="text-2xl text-muted-foreground">This is the allocations page.</p>
</div>
