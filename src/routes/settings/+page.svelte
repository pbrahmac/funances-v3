<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';
	import { ChangePasswordForm, EditProfileForm } from './index';

	export let data: PageData;
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium">Profile</h3>
		<p class="text-sm text-muted-foreground">Change your profile details.</p>
	</div>
	<Separator />
	<EditProfileForm form={data.profileForm} userDetails={data.userDetails} />
	<Separator />
	<div>
		<h3 class="text-lg font-medium">Change Password</h3>
		<p class="text-sm text-muted-foreground">
			Password must be 8 or more characters and contain a letter, number, and special character.
		</p>
	</div>
	<ChangePasswordForm form={data.passwordChangeForm} />
</div>
