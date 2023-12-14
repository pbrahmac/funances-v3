<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Allocations</h3>
		<p class="text-sm text-muted-foreground">
			Add, remove, or change allocation names and percentages.
		</p>
	</div>
	<Separator />
	<div>Form goes here</div>
	<pre>{JSON.stringify(data.allocations, null, 2)}</pre>
</div>
