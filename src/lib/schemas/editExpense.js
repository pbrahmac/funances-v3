import { z } from "zod";

export const editExpenseSchema = z.object({
  expense: z
    .string({ required_error: 'Required.' })
    .min(2, { message: 'Too short.' })
    .max(32, { message: 'Too long.' })
    .trim(),
  notes: z.string().max(64, { message: 'Longer than 64 characters.' }).trim(),
  date: z.string({ required_error: 'Required.' }),
  type: z.string({ required_error: 'Required.' }),
  amount: z.string({ required_error: 'Required.' }).regex(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/)
});