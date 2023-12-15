import { fail } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/client';
import { passwordChangeSchema } from './ChangePasswordForm.svelte';
import { profileFormSchema } from './EditProfileForm.svelte';

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	// init forms
	const profileForm = await superValidate(profileFormSchema);
	const passwordChangeForm = await superValidate(passwordChangeSchema);

	// object to return
	/**
	 * @type {{profileForm: import('sveltekit-superforms').SuperValidated<any>, passwordChangeForm: import('sveltekit-superforms').SuperValidated<any>, userDetails: import('pocketbase').RecordModel | undefined}}
	 */
	const returnProperties = {
		profileForm: profileForm,
		passwordChangeForm: passwordChangeForm,
		userDetails: undefined
	};

	// get user details
	try {
		const userId = event.locals.user?.id ?? '';
		const userObj = await event.locals.pb.collection('users').getOne(userId);
		Object.assign(returnProperties, { userDetails: userObj });
	} catch (err) {
		console.error('Could not fetch user details.');
	}
	return returnProperties;
};

/** @type {import('./$types').Actions} */
export const actions = {
	editProfile: async (event) => {
		const form = await superValidate(event, profileFormSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		// get user details and update user record
		try {
			const userId = event.locals.user?.id ?? '';
			const userObj = await event.locals.pb.collection('users').getOne(userId);

			// check that username isn't taken
			const allUsernames = (await event.locals.pb.collection('users').getFullList()).map(
				(record) => record.username
			);
			if (allUsernames.includes(form.data.username)) {
				return setError(form, 'username', 'Username is taken.');
			}

			// update record
			const updateData = {
				username: form.data.username ?? userObj.username,
				firstName: form.data.firstName ?? userObj.firstName,
				lastName: form.data.lastName ?? userObj.lastName
			};
			await event.locals.pb.collection('users').update(userId, updateData);
		} catch (err) {
			console.error('Failed to update profile.');
			return fail(400, { form });
		}
	},
	changePassword: async (event) => {
		const form = await superValidate(event, passwordChangeSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		// get user and update record
		try {
			const userId = event.locals.user?.id ?? '';
			const updateData = {
				password: form.data.password,
				passwordConfirm: form.data.passwordConfirm,
				oldPassword: form.data.oldPassword
			};
			await event.locals.pb.collection('users').update(userId, updateData);
		} catch (/** @type {any} */ err) {
			if (err.status === 400) {
				return setError(
					form,
					'oldPassword',
					'Something went wrong (double check your old password?).'
				);
			}
		}
	}
};
