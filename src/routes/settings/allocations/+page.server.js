import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { addAllocationSchema } from './AddAllocationForm.svelte';
import { deleteAllocationSchema } from './DeleteAllocationForm.svelte';
import { editAllocationSchema } from './EditAllocationsForm.svelte';

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	// init forms
	const addAllocationForm = await superValidate(addAllocationSchema);
	const deleteAllocationForm = await superValidate(deleteAllocationSchema);
	const editAllocationForm = await superValidate(editAllocationSchema);

	// get allocations
	const allocations = await event.locals.pb.collection('allocations').getFullList();

	return { addAllocationForm, deleteAllocationForm, editAllocationForm, allocations };
};

/** @type {import('./$types').Actions} */
export const actions = {
	addAllocation: async (event) => {
		const form = await superValidate(event, addAllocationSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		// add record
		try {
			const userId = event.locals.user?.id ?? '';

			const updateData = {
				user_id: userId,
				category: form.data.allocation,
				percentage: form.data.percentage
			};
			await event.locals.pb.collection('allocations').create(updateData);
		} catch (/** @type {any} */ err) {
			console.error('Something went wrong: ', err.message);
			return fail(err.status, { form });
		}
	},
	deleteAllocation: async (event) => {
		const form = await superValidate(event, deleteAllocationSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		// delete record
		try {
			await event.locals.pb.collection('allocations').delete(form.data.id);
		} catch (/** @type {any} */ err) {
			console.error('Something went wrong: ', err.message);
			return fail(err.status, { form });
		}
	},
	editAllocation: async (event) => {
		const form = await superValidate(event, editAllocationSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		// get current allocation details and update record
		try {
			const updateData = {
				user_id: event.locals.user?.id,
				category: form.data.allocation,
				percentage: form.data.percentage
			};

			// remove undefined keys
			Object.keys(updateData).forEach(
				// @ts-expect-error
				(key) => updateData[key] === undefined && delete updateData[key]
			);

			await event.locals.pb.collection('allocations').update(form.data.id, updateData);
		} catch (/** @type {any} */ err) {
			console.error('Something went wrong: ', err.message);
			return fail(err.status, { form });
		}
	}
};
