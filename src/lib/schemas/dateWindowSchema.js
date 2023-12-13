import { formatDatepickerString } from '$lib/utils';
import { z } from 'zod';

/**
 *
 * @param {Date} fromDate starting date
 * @param {Date} toDate ending date
 */
export const dateWindowSchemaMaker = (fromDate, toDate) => {
	const schema = z
		.object({
			fromDatePicker: z.string().default(formatDatepickerString(fromDate)),
			toDatePicker: z.string().default(formatDatepickerString(toDate))
		})
		.superRefine(({ fromDatePicker, toDatePicker }, ctx) => {
			if (new Date(toDatePicker) <= new Date(fromDatePicker)) {
				ctx.addIssue({
					code: z.ZodIssueCode.invalid_date,
					message: 'Invalid date range.',
					path: ['toDatePicker']
				});
			}
		});

	return schema;
};

export const dateRangeSchema = z.object({
	start: z.date(),
	end: z.date()
});
