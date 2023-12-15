<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Expense Categories</h3>
		<p class="text-sm text-muted-foreground">Add, remove, or edit expense categories.</p>
	</div>
	<Separator />
	<div>Form goes here</div>
	<pre>{JSON.stringify(data.expense_types, null, 2)}</pre>
</div>
