import { dateRangeSchema } from '$lib/schemas/dateRangeSchema';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		form: await superValidate(dateRangeSchema)
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	updateDateRangeWindow: async (event) => {
		const form = await superValidate(event, dateRangeSchema);

		if (!form.valid) {
			return fail(400, { form });
		}

		console.log(form);
		return { form };
	}
};
