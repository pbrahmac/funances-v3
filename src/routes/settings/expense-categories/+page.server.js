import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { addExpenseCategorySchema } from './AddExpenseCategory.svelte';
import { disableExpenseCategorySchema } from './DisableExpenseCategory.svelte';
import { editExpenseCategorySchema } from './EditExpenseCategory.svelte';

/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	// init forms
	const addExpenseCategoryForm = await superValidate(addExpenseCategorySchema);
	const disableExpenseCategoryForm = await superValidate(disableExpenseCategorySchema);
	const editExpenseCategoryForm = await superValidate(editExpenseCategorySchema);

	// get expense categories
	const expenseTypes = await event.locals.pb
		.collection('expense_types')
		.getFullList({ filter: 'isEnabled = true', sort: 'type' });
	const unfilteredExpenseTypes = await event.locals.pb
		.collection('expense_types')
		.getFullList({ sort: '-isEnabled,type' });

	return {
		addExpenseCategoryForm,
		disableExpenseCategoryForm,
		editExpenseCategoryForm,
		expenseTypes,
		unfilteredExpenseTypes
	};
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
				tagColor: form.data.tagColor.toLowerCase(),
				isEnabled: true
			};
			await event.locals.pb.collection('expense_types').create(updateData);
		} catch (/** @type {any} */ err) {
			console.error('Something went wrong: ', err.message);
			return fail(err.status, { form });
		}
	},
	disableExpenseCategory: async (event) => {
		const form = await superValidate(event, disableExpenseCategorySchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		// disable record
		try {
			await event.locals.pb.collection('expense_types').update(form.data.id, { isEnabled: false });
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
			const updateData = {
				type: form.data.category,
				user_id: event.locals.user?.id,
				tagColor: form.data.tagColor?.toLowerCase()
			};

			// remove undefined keys
			Object.keys(updateData).forEach(
				// @ts-expect-error
				(key) => updateData[key] === undefined && delete updateData[key]
			);

			await event.locals.pb.collection('expense_types').update(form.data.id, updateData);
		} catch (/** @type {any} */ err) {
			console.error('Something went wrong: ', err.message);
			return fail(err.status, { form });
		}
	}
};
