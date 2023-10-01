<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { getAvatarURL } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import type { BaseModel } from 'pocketbase';

	export let user: BaseModel | undefined;
	export let fallback: string;
</script>

<div class="flex flex-col lg:hidden justify-center items-start space-y-3 mb-3">
	<div class="flex items-center justify-center w-full space-x-3">
		<Avatar.Root class="w-12 lg:w-1/6 h-auto">
			<Avatar.Image src={getAvatarURL(user?.id)} alt={`@${user?.username}`} />
			<Avatar.Fallback>{fallback}</Avatar.Fallback>
		</Avatar.Root>
		<h2>{`${user?.firstName} ${user?.lastName}`}</h2>
		<Separator orientation="vertical" class="h-6" />
		<p>{`@${user?.username}`}</p>
	</div>
	<Separator />
	<p>All settings will go here.</p>
</div>
