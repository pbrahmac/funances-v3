import { signInFormSchema } from '$lib/schemas/signin';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/client';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  return { form: superValidate(signInFormSchema) }
};

/** @type {import('./$types').Actions} */
export const actions = {
  default: async (event) => {
    const form = await superValidate(event, signInFormSchema);

    // validate form
    if (!form.valid) {
      return fail(400, { form });
    }

    // login through Pocketbase
    try {
      await event.locals.pb
        .collection('users')
        .authWithPassword(form.data.username, form.data.password);
      await event.locals.pb.collection('users').authRefresh();
    } catch (/** @type {any} */ err) {
      if (err.status == 400 && err.message === "Failed to authenticate.") {
        return setError(form, 'password', 'Incorrect password or username.', { status: 401 });
      }
    }

    // redirect to home page
    throw redirect(303, '/');
  }
};