<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { getAvatarURL } from '$lib/utils';
	import type { BaseModel } from 'pocketbase';

	// props
	export let user: BaseModel;

	const fallback = user?.firstName.at(0) + user?.lastName.at(0).toUpperCase();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Avatar.Root>
			<Avatar.Image src={getAvatarURL(user?.id)} alt={`@${user?.username}`} />
			<Avatar.Fallback>{fallback}</Avatar.Fallback>
		</Avatar.Root>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>@{user.username}</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<a href="/settings">
				<DropdownMenu.Item class="cursor-pointer">Settings</DropdownMenu.Item>
			</a>
			<form action="/logout" method="post">
				<button type="submit" class="w-full">
					<DropdownMenu.Item class="cursor-pointer">Log Out</DropdownMenu.Item>
				</button>
			</form>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
