<script lang="ts" context="module">
	import { z } from 'zod';
	export const passwordChangeSchema = z
		.object({
			oldPassword: z.string({ required_error: 'Required' }),
			password: z
				.string({ required_error: 'Required' })
				.regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\-])[A-Za-z\d@$!%*#?&\-]{8,}$/, {
					message: "Password doesn't match the requirements."
				}),
			passwordConfirm: z.string({ required_error: 'Required' })
		})
		.superRefine(({ passwordConfirm, password }, ctx) => {
			if (passwordConfirm !== password) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Passwords must match.',
					path: ['passwordConfirm']
				});
			}
		});

	export type PasswordChangeSchema = typeof passwordChangeSchema;
</script>

<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Form from '$lib/components/ui/form';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let form: SuperValidated<PasswordChangeSchema>;

	// progressive enhancement functions
	const submitChangePassword: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type == 'success') {
				await invalidateAll();
				toast.success('Password changed.');
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
	schema={passwordChangeSchema}
	let:config
	class="space-y-4 lg:w-2/3"
	asChild
>
	<form action="?/changePassword" method="post" use:enhance={submitChangePassword}>
		<Form.Item>
			<Form.Field {config} name="oldPassword">
				<Form.Label>Old Password</Form.Label>
				<Form.Input type="password" placeholder="••••••••" />
				<Form.Validation />
			</Form.Field>
		</Form.Item>
		<Form.Item>
			<Form.Field {config} name="password">
				<Form.Label>New Password</Form.Label>
				<Form.Input type="password" placeholder="••••••••" />
				<Form.Validation />
			</Form.Field>
		</Form.Item>
		<Form.Item>
			<Form.Field {config} name="passwordConfirm">
				<Form.Label>Confirm New Password</Form.Label>
				<Form.Input type="password" placeholder="••••••••" />
				<Form.Validation />
			</Form.Field>
		</Form.Item>
		<Form.Button>Change Password</Form.Button>
	</form>
</Form.Root>
