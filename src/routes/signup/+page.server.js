import { signUpFormSchema } from '$lib/schemas/signup';
import { nameToColor } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/client';

// default expense types
const defaultExpenses = [
  'Rent + Utilities',
  'Bills',
  'Groceries',
  'Gas',
  'Eating Out',
  'Transportation',
  'Fun Purchase',
  'Other Purchase'
];

// default allocations
const defaultAllocations = [
  { category: 'Brokerage', percentage: 0.19 },
  { category: 'Savings Account', percentage: 0.285 },
  { category: 'Rainy Day Fund', percentage: 0.025 },
  { category: 'Donation', percentage: 0.1 }
];



/** @type {import('./$types').PageServerLoad} */
export async function load() {
  return { form: superValidate(signUpFormSchema) };
};

/** @type {import('./$types').Actions} */
export const actions = {
  default: async (event) => {
    const form = await superValidate(event, signUpFormSchema);
    console.log(form.data);

    // validate form
    if (!form.valid) {
      return fail(400, { form });
    }

    // create user through Pocketbase
    try {
      const user = await event.locals.pb.collection('users').create({
        username: form.data.username,
        password: form.data.password,
        passwordConfirm: form.data.passwordConfirm,
        firstName: form.data.firstName,
        lastName: form.data.lastName
      });

      // login as user and refresh authStore
      await event.locals.pb
        .collection('users')
        .authWithPassword(form.data.username, form.data.password);
      await event.locals.pb.collection('users').authRefresh();

      // requests to populate with default expense types
      defaultExpenses.forEach(async (expenseType) => {
        await event.locals.pb.collection('expense_types').create(
          {
            type: expenseType,
            user_id: user.id,
            tagColor: nameToColor(expenseType)
          },
          { $autoCancel: false }
        );
      });

      // requests to populate with default allocations
      defaultAllocations.forEach(async (allocation) => {
        await event.locals.pb.collection('allocations').create(
          {
            user_id: user.id,
            category: allocation.category,
            percentage: allocation.percentage
          },
          { $autoCancel: false }
        );
      });

      // log out user
      event.locals.pb.authStore.clear();
    } catch (/** @type {any} */ err) {
      return setError(form, 'passwordConfirm', 'An error occurred.', { status: err.status });
    }

    throw redirect(303, '/signin');
  }

};