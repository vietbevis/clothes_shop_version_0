import { z } from 'zod'

import { EmailSchema, NameSchema, PasswordSchema } from '@/validation/CommonSchema'

export const RegisterSchema = z
  .object({
    fullName: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema
  })
  .strict()
  .strip()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password does not match.',
    path: ['confirmPassword']
  })

export type RegisterBodyType = z.infer<typeof RegisterSchema>

export const LoginSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    deviceName: z.string().min(3).max(255),
    deviceType: z.string().min(3).max(255)
  })
  .strict()
  .strip()

export type LoginBodyType = z.infer<typeof LoginSchema>

export const VerifyAccountSchema = z
  .object({
    email: EmailSchema,
    token: z.string().length(6)
  })
  .strict()
  .strip()

export type VerifyAccountBodyType = z.infer<typeof VerifyAccountSchema>

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string()
  })
  .strict()
  .strip()

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenSchema>

export const EmailParamsSchema = z
  .object({
    email: EmailSchema
  })
  .strict()
  .strip()

export type EmailParamsType = z.infer<typeof EmailParamsSchema>

export const ForgotPasswordSchema = z
  .object({
    email: EmailSchema,
    token: z.string().length(6),
    newPassword: PasswordSchema,
    confirmNewPassword: PasswordSchema
  })
  .strict()
  .strip()
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Confirm password does not match.',
    path: ['confirmNewPassword']
  })

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordSchema>

export const ChangePasswordSchema = z
  .object({
    currentPassword: PasswordSchema,
    newPassword: PasswordSchema,
    confirmNewPassword: PasswordSchema
  })
  .strict()
  .strip()
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Confirm password does not match.',
    path: ['confirmNewPassword']
  })

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordSchema>
