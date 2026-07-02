import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;
