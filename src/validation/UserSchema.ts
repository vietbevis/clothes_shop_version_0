import { z } from 'zod';

import { EmailSchema, NameSchema, PasswordSchema } from '@/validation/CommonSchema';

export const RegisterSchema = z
  .object({
    fullName: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .strict()
  .strip()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password does not match.',
    path: ['confirmPassword'],
  });

export type RegisterBodyType = z.infer<typeof RegisterSchema>;

export const LoginSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
  })
  .strict()
  .strip();

export type LoginBodyType = z.infer<typeof LoginSchema>;
