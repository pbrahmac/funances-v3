import { z } from 'zod';

export const signUpFormSchema = z
  .object({
    firstName: z
      .string({ required_error: 'Required' })
      .regex(/^[a-zA-Z\-]*$/, {
        message: 'No spaces, numbers, or special characters'
      })
      .min(2, { message: 'First name must be between 2-32 characters' })
      .max(32, { message: 'First name must be between 2-32 characters' })
      .trim(),
    lastName: z
      .string({ required_error: 'Required' })
      .regex(/^[a-zA-Z\-]*$/, {
        message: 'No spaces, numbers, or special characters'
      })
      .min(2, { message: 'Last name must be between 2-32 characters' })
      .max(32, { message: 'Last name must be between 2-32 characters' })
      .trim(),
    username: z
      .string({ required_error: 'Required' })
      .regex(/^[A-Za-z0-9]*$/, {
        message: 'No spaces or special characters'
      })
      .min(3, { message: 'Username must be between 3-16 characters' })
      .max(16, { message: 'Username must be between 3-16 characters' })
      .trim(),
    password: z
      .string({ required_error: 'Required' })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\-])[A-Za-z\d@$!%*#?&\-]{8,}$/, {
        message:
          'Password must be >=8 characters and contain a letter, number, and special character'
      }),
    passwordConfirm: z.string({ required_error: 'Required' })
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords must match',
        path: ['passwordConfirm']
      });
    }
  });