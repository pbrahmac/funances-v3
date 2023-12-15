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
	import * as Form from '$lib/components/ui/form';
	import type { RecordModel } from 'pocketbase';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let form: SuperValidated<ProfileFormSchema>;
	export let userDetails: RecordModel | undefined;
</script>

<Form.Root
	method="POST"
	action="?/editProfile"
	{form}
	schema={profileFormSchema}
	let:config
	class="space-y-4"
>
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
			<Form.Input placeholder={userDetails?.username} />
			<Form.Description>What you use to log in.</Form.Description>
			<Form.Validation />
		</Form.Field>
	</Form.Item>
	<Form.Button>Update Profile</Form.Button>
</Form.Root>
