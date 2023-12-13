import { z } from 'zod';
export const formSchema = z.object({
	start: z.string(),
	end: z.string()
});
export type FormSchema = typeof formSchema;
