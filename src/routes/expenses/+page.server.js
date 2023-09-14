import { addExpenseSchema } from '$lib/schemas/addExpense';
import { formatDate, serializeNonPOJOs } from '$lib/utils';
import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';

// Constants and initial variables


// helper functions
const dateWindow = (monthOffset = 1) => {
  let [fromDate, toDate] = [new Date(), new Date()];
  // reset both to 00:00:00
  fromDate.setMonth(fromDate.getMonth() - monthOffset);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  // set initial end date to be until 11:59:59 of that day
  toDate = new Date(toDate.getTime() + 86400 * 1000 - 1);
  return { from: fromDate, to: toDate };
}

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
  // initialize forms
  const form = await superValidate(addExpenseSchema);

  // get limit and pageNum params for pagination
  const limit = Number(event.url.searchParams.get('limit')) || 10;
  const pageNum = Number(event.url.searchParams.get('pageNum')) || 1;

  /**
   * Gets paginated list of expenses from Pocketbase
   * @param {number} limit The number of items displayed per page
   * @param {number} pageNum The offset (for pagination)
   */
  async function getExpenses(limit = 10, pageNum = 1) {
    // validate limit (to not fetch too many records at once)
    if (limit > 100) {
      throw error(400, 'Bad Request');
    }

    // fetch from Pocketbase
    try {
      // const rawExpenses = await event.locals.pb.collection('expenses').getList(pageNum, limit, {
      //   filter: `date >= "${formatDate(dateWindow().from, false)}" && date <= "${formatDate(dateWindow().to)}"`,
      //   sort: '-date',
      //   expand: 'expense_type'
      // });

      const rawExpenses = await event.locals.pb.collection('expenses').getFullList({
        filter: `date >= "${formatDate(dateWindow().from, false)}" && date <= "${formatDate(dateWindow().to)}"`,
        sort: '-date',
        expand: 'expense_type'
      });

      const expenses = rawExpenses.map((expense) => ({
        id: expense.id,
        date: expense.date,
        expense: expense.title,
        category: {
          name: expense.expand?.expense_type.type || 'N/A',
          color: expense.expand?.expense_type.tagColor || '#64748b'
        },
        amount: expense.amount,
        notes: expense.details
      }));

      // return {
      //   items: expenses,
      //   page: rawExpenses.page,
      //   perPage: rawExpenses.perPage,
      //   totalItems: rawExpenses.totalItems,
      //   totalPages: rawExpenses.totalPages,
      // }

      return {
        items: expenses
      }
    } catch (/** @type {any} */ err) {
      console.log(err.status, err.message);
    }
  }

  async function getExpenseTypes() {
    // fetch expense type information
    const rawExpenseTypes = await event.locals.pb
      .collection('expense_types')
      .getFullList(50, { sort: 'type' });

    return rawExpenseTypes.map((expenseType) => ({
      id: expenseType.id,
      name: expenseType.type,
      color: expenseType.tagColor
    }));
  }

  return { form: form, expenses: getExpenses(limit, pageNum), expenseTypes: getExpenseTypes() };
}

/** @type {import('./$types').Actions} */
export const actions = {
  addExpense: async (event) => {
    const form = await superValidate(event, addExpenseSchema);

    // validate errors
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // auth user and get id
      const user_id = event.locals.user?.id;

      // add current time to inputted date
      const inputtedDate = new Date(form.data.date);
      let finalDate = new Date();
      finalDate.setDate(inputtedDate.getDate());
      finalDate.setMonth(inputtedDate.getMonth());
      finalDate.setFullYear(inputtedDate.getFullYear());

      // make request to create new expense record
      await event.locals.pb.collection('expenses').create({
        user_id: user_id,
        expense_type: form.data.type,
        date: finalDate.toISOString(),
        title: form.data.expense,
        details: form.data.notes ?? '',
        amount: form.data.amount
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
          amount: aggregateRecord.amount + parseFloat(form.data.amount),
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
    } catch (/** @type {any} */ err) {
      console.log('Error: ', err);
      return fail(400, { form });
    }

    return { success: true };
  },
  delete: async (event) => {
    const form = await superValidate(event, z.object({
      id: z.string({ required_error: 'Required.' }).trim()
    }));

    // validate errors
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      // auth user and get id
      const user_id = event.locals.user?.id;

      // get details of to be deleted expense
      const deletedExpense = await event.locals.pb.collection('expenses').getOne(form.data.id);
      const deletedExpenseDate = new Date(deletedExpense.date);

      // delete record
      await event.locals.pb.collection('expenses').delete(form.data.id);

      // update aggregates table
      try {
        const aggregateRecord = serializeNonPOJOs(
          await event.locals.pb
            .collection('expense_aggregates')
            .getFirstListItem(
              `month = ${deletedExpenseDate.getMonth() + 1} && type_id = "${deletedExpense.expense_type
              }"`
            )
        );
        await event.locals.pb.collection('expense_aggregates').update(aggregateRecord.id, {
          user_id: user_id,
          type_id: deletedExpense.expense_type,
          amount: aggregateRecord.amount - deletedExpense.amount,
          month: deletedExpenseDate.getMonth() + 1,
          year: deletedExpenseDate.getFullYear()
        });

        if (aggregateRecord.amount - deletedExpense.amount == 0) {
          await event.locals.pb.collection('expense_aggregates').delete(aggregateRecord.id);
        }
      } catch (/** @type {any} */ err) {
        if (err.status == 404) {
          console.log('No record of aggregate here.');
        } else {
          console.log('Error: ', err);
          return fail(err.status, { form });
        }
      }
    } catch (err) {
      console.log('Error: ', err);
      return fail(400, { form });
    }

    return { form };
  }
};