import { z } from 'zod';

export const signInFormSchema = z.object({
  username: z
    .string({ required_error: 'Required' })
    .min(3, { message: 'Username must be between 3-16 characters' })
    .max(16, { message: 'Username must be between 3-16 characters' })
    .trim(),
  password: z
    .string({ required_error: 'Required' })
    .min(8, { message: 'Password must be between 8-32 characters' })
    .max(32, { message: 'Password must be between 8-32 characters' })
})