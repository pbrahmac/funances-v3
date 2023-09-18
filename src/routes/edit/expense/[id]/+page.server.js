import { editExpenseSchema } from '$lib/schemas/editExpense';
import { formatDatepickerString } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { serializeNonPOJOs } from "$lib/utils";

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
  const id = event.params.id;

  /**
   * @type {import('$lib/utils').Expense}
   */
  let expense;

  const rawExpense = await event.locals.pb.collection('expenses').getOne(id, { expand: 'expense_type' });
  expense = {
    id: rawExpense.id,
    date: rawExpense.date,
    expense: rawExpense.title,
    category: {
      id: rawExpense.expense_type,
      name: rawExpense.expand?.expense_type.type,
      color: rawExpense.expand?.expense_type.tagColor
    },
    amount: rawExpense.amount,
    notes: rawExpense.details
  }

  const newEditExpenseSchema = editExpenseSchema.extend({
    expense: editExpenseSchema.shape.expense.default(expense.expense),
    notes: editExpenseSchema.shape.notes.default(expense.notes),
    date: editExpenseSchema.shape.date.default(formatDatepickerString(new Date(expense.date))),
    type: editExpenseSchema.shape.type.default(expense.category.id),
    amount: editExpenseSchema.shape.amount.default(expense.amount.toString())
  });

  // init edit expense form
  const form = await superValidate(event, newEditExpenseSchema);

  // get expense types
  const rawExpenseTypes = await event.locals.pb.collection('expense_types').getFullList(50, { sort: 'type' });
  const expenseTypes = rawExpenseTypes.map((type) => ({
    id: type.id,
    name: type.type,
    color: type.tagColor
  }))

  return { form, expense, expenseTypes };
};

/** @type {import('./$types').Actions} */
export const actions = {
  default: async (event) => {
    const form = await superValidate(event, editExpenseSchema);

    // validate errors
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // auth user and get id
      const user_id = event.locals.user?.id;

      const id = event.params.id;

      // get old record for updating aggregate table
      const oldExpense = await event.locals.pb.collection('expenses').getOne(id);

      // add current time to inputted date
      const inputtedDate = new Date(form.data.date);
      let finalDate = new Date();
      finalDate.setDate(inputtedDate.getDate());
      finalDate.setMonth(inputtedDate.getMonth());
      finalDate.setFullYear(inputtedDate.getFullYear());

      // update record in pb
      await event.locals.pb.collection('expenses').update(id, {
        user_id: user_id,
        expense_type: form.data.type,
        date: finalDate.toISOString(),
        title: form.data.expense,
        details: form.data.notes ?? '',
        amount: parseFloat(form.data.amount)
      });

      // update aggregates table
      try {
        const aggregateRecord = serializeNonPOJOs(
          await event.locals.pb
            .collection('expense_aggregates')
            .getFirstListItem(
              `month = ${finalDate.getMonth() + 1} && type_id = "${form.data.type}"`
            )
        );

        await event.locals.pb.collection('expense_aggregates').update(aggregateRecord.id, {
          user_id: user_id,
          type_id: form.data.type,
          amount: aggregateRecord.amount - oldExpense.amount + parseFloat(form.data.amount),
          month: finalDate.getMonth() + 1,
          year: finalDate.getFullYear()
        });
      } catch (/** @type {any} */ err) {
        if (err.status == 404) {
          try {
            await event.locals.pb.collection('expense_aggregates').create({
              user_id: user_id,
              type_id: form.data.type,
              amount: form.data.amount,
              month: finalDate.getMonth() + 1,
              year: finalDate.getFullYear()
            });
          } catch (/** @type {any} */ err) {
            console.log('Error: ', err);
            return fail(err.status, { form });
          }
        } else {
          console.log('Error: ', err);
          return fail(err.status, { form });
        }
      }
    } catch (err) {
      console.log('Error: ', err);
      return fail(400, { form });
    }

    throw redirect(303, '/expenses');
  }
};