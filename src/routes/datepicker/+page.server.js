import { formSchema } from '$lib/schemas/datepickerSchema';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {
		form: superValidate(formSchema)
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		const form = await superValidate(event, formSchema);

		console.log(form);
		console.log('submitted!');

		if (!form.valid) {
			return fail(400, { form });
		}

		return { form };
	}
};
