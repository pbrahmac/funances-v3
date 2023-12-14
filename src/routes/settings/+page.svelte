<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';
	import ProfileForm from './ProfileForm.svelte';

	export let data: PageData;
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Profile</h3>
		<p class="text-sm text-muted-foreground">Change your profile details.</p>
	</div>
	<Separator />
	<ProfileForm form={data.form} userDetails={data.userDetails} />
</div>
