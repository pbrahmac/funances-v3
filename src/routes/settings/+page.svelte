<script lang="ts">
	import type { PageData } from './$types';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button, buttonVariants } from '$lib/components/ui/button';
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
		<Avatar.Root class="w-1/3 lg:w-1/6 xl:w-1/12 h-auto">
			<Avatar.Image src={getAvatarURL(data.user?.id)} alt={`@${data.user?.username}`} />
			<Avatar.Fallback>{fallback}</Avatar.Fallback>
		</Avatar.Root>
		<h2 class="text-4xl">{`${data.user?.firstName} ${data.user?.lastName}`}</h2>
		<p class="text-2xl">{`@${data.user?.username}`}</p>
		<Separator />
	</div>

	<div class="flex flex-col justify-center space-y-4 my-4 text-left">
		<h3 class="text-xl font-bold">Account</h3>
		<!-- temp UI - replace with form -->
		<div class="flex items-center justify-start space-x-2">
			<Input placeholder="First name" class="max-w-max" />
			<Button>Change</Button>
		</div>
		<div class="flex items-center justify-start space-x-2">
			<Input placeholder="Last name" class="max-w-max" />
			<Button>Change</Button>
		</div>
		<div class="flex items-center justify-start space-x-2">
			<Input placeholder="username" class="max-w-max" />
			<Button>Change</Button>
		</div>
		<Dialog.Root>
			<Dialog.Trigger class={`${buttonVariants({ variant: 'default' })} w-fit`}>
				Change Password
			</Dialog.Trigger>
			<Dialog.Content class="max-w-sm">
				<Dialog.Header>
					<Dialog.Title>Change Password</Dialog.Title>
					<Dialog.Description>Can't be the same as the old one.</Dialog.Description>
				</Dialog.Header>
				<div class="max-w-sm flex flex-col space-y-4 py-2">
					<div>
						<Label>Old Password</Label>
						<Input  type="password" />
					</div>
					<div>
						<Label>New Password</Label>
						<Input  type="password" />
					</div>
					<div>
						<Label>Confirm New Password</Label>
						<Input type="password" />
					</div>
					<Button class="w-fit">Change</Button>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</div>
