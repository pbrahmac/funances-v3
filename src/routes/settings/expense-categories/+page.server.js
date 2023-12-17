import { superValidate } from 'sveltekit-superforms/client';
import { editExpenseCategorySchema } from './EditExpenseCategory.svelte';
import { addExpenseCategorySchema } from './AddExpenseCategory.svelte';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	// init forms
	const addExpenseCategoryForm = await superValidate(addExpenseCategorySchema);
	const editExpenseCategoryForm = await superValidate(editExpenseCategorySchema);

	// get expense categories
	const expense_types = await event.locals.pb.collection('expense_types').getFullList();

	return { addExpenseCategoryForm, editExpenseCategoryForm, expense_types };
};

/** @type {import('./$types').Actions} */
export const actions = {
	addExpenseCategory: async (event) => {
		const form = await superValidate(event, addExpenseCategorySchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		// create record
		try {
			const userId = event.locals.user?.id ?? '';
			const updateData = {
				type: form.data.category,
				user_id: userId,
				tagColor: form.data.tagColor.toLowerCase()
			};
			await event.locals.pb.collection('expense_types').create(updateData);
		} catch (/** @type {any} */ err) {
			console.error('Something went wrong: ', err.message);
			return fail(err.status, { form });
		}
	},
	editExpenseCategory: async (event) => {
		const form = await superValidate(event, editExpenseCategorySchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		// get current category details and update record
		try {
			const userId = event.locals.user?.id ?? '';
			const currentCategory = await event.locals.pb
				.collection('expense_types')
				.getOne(form.data.id);

			const updateData = {
				type: form.data.category ?? currentCategory.type,
				user_id: userId,
				tagColor: form.data.tagColor ?? currentCategory.tagColor
			};
			await event.locals.pb.collection('expense_types').update(form.data.id, updateData);
		} catch (/** @type {any} */ err) {
			console.error('Something went wrong: ', err.message);
			return fail(err.status, { form });
		}
	}
};
