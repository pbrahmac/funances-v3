<script lang="ts">
	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		// @ts-expect-error View Transition API types aren't supported yet
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			// @ts-expect-error View Transition API types aren't supported yet
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>
