import { formatDatepickerString } from "$lib/utils";
import { z } from "zod";

export const addIncomeSchema = z.object({
  income: z
    .string({ required_error: 'Required.' })
    .min(2, { message: 'Too short.' })
    .max(32, { message: 'Too long.' })
    .trim(),
  notes: z.string().max(64, { message: 'Longer than 64 characters.' }).trim(),
  date: z.string({ required_error: 'Required.' }).default(formatDatepickerString(new Date())),
  gross_amount: z
    .string({ required_error: 'Required.' })
    .regex(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/),
  taxes: z
    .string({ required_error: 'Required.' })
    .regex(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)
    .default('0'),
  benefits: z
    .string({ required_error: 'Required.' })
    .regex(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)
    .default('0'),
  retirement_401k: z
    .string({ required_error: 'Required.' })
    .regex(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)
    .default('0'),
  is_paycheck: z.boolean().default(false)
});