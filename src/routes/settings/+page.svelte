<script lang="ts">
	import type { PageData } from './$types';
	import * as Avatar from '$lib/components/ui/avatar';
	import { getAvatarURL } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import MobileSettings from './MobileSettings.svelte';

	// props
	export let data: PageData;

	const fallback = data.user?.firstName.at(0) + data.user?.lastName.at(0).toUpperCase();
</script>

<div class="fullPageContainer p-3 lg:p-6">
	<!-- mobile -->
	<MobileSettings user={data.user} {fallback} />

	<!-- desktop -->
	<div class="hidden lg:flex flex-col space-y-4 items-center justify-center text-center">
		<Avatar.Root class="w-1/3 lg:w-1/6 h-auto">
			<Avatar.Image src={getAvatarURL(data.user?.id)} alt={`@${data.user?.username}`} />
			<Avatar.Fallback>{fallback}</Avatar.Fallback>
		</Avatar.Root>
		<h2 class="text-4xl">{`${data.user?.firstName} ${data.user?.lastName}`}</h2>
		<p class="text-2xl">{`@${data.user?.username}`}</p>
		<Separator />
		<p>All of the settings will go here.</p>
	</div>
</div>
