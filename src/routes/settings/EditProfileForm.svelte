<script lang="ts" context="module">
	import { z } from 'zod';
	export const profileFormSchema = z.object({
		firstName: z
			.string()
			.regex(/^[a-zA-Z\-]*$/, {
				message: 'No spaces, numbers, or special characters.'
			})
			.min(2, { message: 'Must be between 2-32 characters.' })
			.max(32, { message: 'Must be between 2-32 characters.' })
			.trim()
			.optional(),
		lastName: z
			.string()
			.regex(/^[a-zA-Z\-]*$/, {
				message: 'No spaces, numbers, or special characters'
			})
			.min(2, { message: 'Must be between 2-32 characters.' })
			.max(32, { message: 'Must be between 2-32 characters.' })
			.trim()
			.optional(),
		username: z
			.string()
			.regex(/^[A-Za-z0-9]*$/, {
				message: 'No spaces or special characters.'
			})
			.trim()
			.optional()
	});

	export type ProfileFormSchema = typeof profileFormSchema;
</script>

<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { RecordModel } from 'pocketbase';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let form: SuperValidated<ProfileFormSchema>;
	export let userDetails: RecordModel | undefined;

	// progressive enhancement functions
	const submitEditProfile: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				toast.success('Profile saved.');
			} else {
				toast.error('Something went wrong.');
			}
			await applyAction(result);
		};
	};
</script>

<Form.Root
	method="POST"
	{form}
	schema={profileFormSchema}
	let:config
	class="space-y-4 lg:w-2/3"
	asChild
>
	<form action="?/editProfile" method="post" use:enhance={submitEditProfile}>
		<Form.Item>
			<Form.Field {config} name="firstName">
				<Form.Label>First Name</Form.Label>
				<Form.Input placeholder={userDetails?.firstName} />
				<Form.Validation />
			</Form.Field>
		</Form.Item>
		<Form.Item>
			<Form.Field {config} name="lastName">
				<Form.Label>Last Name</Form.Label>
				<Form.Input placeholder={userDetails?.lastName} />
				<Form.Validation />
			</Form.Field>
		</Form.Item>
		<Form.Item>
			<Form.Field {config} name="username">
				<Form.Label>Username</Form.Label>
				<div class="flex items-center">
					<span class="px-2 py-1.5 -z-10 rounded-l-sm bg-secondary drop-shadow-sm">@</span>
					<Form.Input class="rounded-l-none" placeholder={userDetails?.username} />
				</div>
				<Form.Description>What you use to log in.</Form.Description>
				<Form.Validation />
			</Form.Field>
		</Form.Item>
		<Form.Button>Update Profile</Form.Button>
	</form>
</Form.Root>
