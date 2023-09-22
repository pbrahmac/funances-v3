import { editIncomeSchema } from '$lib/schemas/editIncome';
import { formatDatepickerString } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { serializeNonPOJOs } from '$lib/utils';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	const id = event.params.id;

	/**
	 * @type {import('$lib/utils').Income}
	 */
	let income;

	const rawIncome = await event.locals.pb.collection('income').getOne(id);
	income = {
		id: rawIncome.id,
		date: rawIncome.date,
		income: rawIncome.title,
		notes: rawIncome.details,
		gross_amount: rawIncome.gross_amount,
		benefits: rawIncome.benefits,
		retirement_401k: rawIncome.retirement_401k,
		taxes: rawIncome.taxes,
		is_paycheck: rawIncome.is_paycheck
	};

	// edit editIncomeSchema with expense data
	const newEditIncomeSchema = editIncomeSchema.extend({
		income: editIncomeSchema.shape.income.default(income.income),
		date: editIncomeSchema.shape.date.default(formatDatepickerString(new Date(income.date))),
		notes: editIncomeSchema.shape.notes.default(income.notes),
		gross_amount: editIncomeSchema.shape.gross_amount.default(income.gross_amount.toString()),
		taxes: editIncomeSchema.shape.taxes.default(income.taxes.toString()),
		benefits: editIncomeSchema.shape.benefits.default(income.benefits.toString()),
		retirement_401k: editIncomeSchema.shape.retirement_401k.default(
			income.retirement_401k.toString()
		),
		is_paycheck: editIncomeSchema.shape.is_paycheck.default(income.is_paycheck)
	});

	// init edit expense form
	const form = await superValidate(event, newEditIncomeSchema);

	return { form, income: income };
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		const form = await superValidate(event, editIncomeSchema);

		// validate errors
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// auth user and get id
			const user_id = event.locals.user?.id;

			const id = event.params.id;

			// add current time to inputted date
			const inputtedDate = new Date(form.data.date);
			let finalDate = new Date();
			finalDate.setDate(inputtedDate.getDate());
			finalDate.setMonth(inputtedDate.getMonth());
			finalDate.setFullYear(inputtedDate.getFullYear());

			// update record in pb
			await event.locals.pb.collection('income').update(id, {
				user_id: user_id,
				title: form.data.income,
				details: form.data.notes,
				gross_amount: form.data.gross_amount,
				taxes: form.data.taxes,
				benefits: form.data.benefits,
				retirement_401k: form.data.retirement_401k,
				is_paycheck: form.data.is_paycheck,
				date: finalDate.toISOString()
			});
		} catch (err) {
			console.log('Error: ', err);
			return fail(400, { form });
		}

		throw redirect(303, '/income');
	}
};
