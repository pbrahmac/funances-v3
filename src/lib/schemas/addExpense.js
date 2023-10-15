import { formatDatepickerString } from '$lib/utils';
import { z } from 'zod';

export const addExpenseSchema = z.object({
	expense: z
		.string({ required_error: 'Required.' })
		.min(2, { message: 'Too short.' })
		.max(32, { message: 'Too long.' })
		.trim(),
	notes: z.string().max(64, { message: 'Longer than 64 characters.' }).trim().default(''),
	date: z.string({ required_error: 'Required.' }).default(formatDatepickerString(new Date())),
	type: z.string({ required_error: 'Required.' }).nonempty({ message: 'Must choose a category.' }),
	amount: z.string({ required_error: 'Required.' }).regex(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)
});
