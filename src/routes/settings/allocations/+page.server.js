import { superValidate } from 'sveltekit-superforms/client';
import { editAllocationSchema } from './EditAllocationsForm.svelte';
import { fail } from '@sveltejs/kit';
import { addAllocationSchema } from './AddAllocationForm.svelte';

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	// init forms
	const addAllocationForm = await superValidate(addAllocationSchema);
	const editAllocationForm = await superValidate(editAllocationSchema);

	// get allocations
	const allocations = await event.locals.pb.collection('allocations').getFullList();

	return { addAllocationForm, editAllocationForm, allocations };
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
				category: form.data.category,
				percentage: form.data.percentage
			};
			await event.locals.pb.collection('allocations').create(updateData);
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
			const userId = event.locals.user?.id ?? '';
			const currentAllocation = await event.locals.pb
				.collection('allocations')
				.getOne(form.data.id);
			const updateData = {
				user_id: userId,
				category: form.data.category ?? currentAllocation.category,
				percentage: form.data.percentage ?? currentAllocation.percentage
			};
			await event.locals.pb.collection('allocations').update(form.data.id, updateData);
		} catch (/** @type {any} */ err) {
			console.error('Something went wrong: ', err.message);
			return fail(err.status, { form });
		}
	}
};
