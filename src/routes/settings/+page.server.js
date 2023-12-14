import { setError, superValidate } from 'sveltekit-superforms/client';
import { profileFormSchema } from './ProfileForm.svelte';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	// get user details
	try {
		const userId = event.locals.user?.id ?? '';
		const userObj = await event.locals.pb.collection('users').getOne(userId);
		return { userDetails: userObj, form: await superValidate(profileFormSchema) };
	} catch (err) {
		console.error('Could not fetch user details.');
		return { form: await superValidate(profileFormSchema) };
	}
};

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
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
	}
};

// export async function load(event) {
// 	async function getAllocations() {
// 		const rawAllocations = await event.locals.pb.collection('allocations').getFullList();
// 		return rawAllocations;
// 	}

// 	return { allocations: getAllocations() };
// }
