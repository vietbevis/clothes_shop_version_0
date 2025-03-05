import { z } from 'zod'

import { EmailSchema, NameSchema, PasswordSchema } from '@/validation/CommonSchema'
import { VerificationCodeType } from '@/utils/enums'

export const RegisterSchema = z
  .object({
    fullName: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    otp: z.string().length(6)
  })
  .strict()
  .strip()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password does not match.',
    path: ['confirmPassword']
  })

export const LoginSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    deviceId: z.string().min(3).max(255)
  })
  .strict()
  .strip()

export const VerifyAccountSchema = z
  .object({
    email: EmailSchema,
    token: z.string().length(6)
  })
  .strict()
  .strip()

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string()
  })
  .strict()
  .strip()

export const EmailParamsSchema = z
  .object({
    email: EmailSchema
  })
  .strict()
  .strip()

export const ForgotPasswordSchema = z
  .object({
    email: EmailSchema,
    otp: z.string().length(6),
    newPassword: PasswordSchema,
    confirmNewPassword: PasswordSchema
  })
  .strict()
  .strip()
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Confirm password does not match.',
    path: ['confirmNewPassword']
  })

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

export const SendOTPBodySchema = z
  .object({
    email: EmailSchema,
    type: z.nativeEnum(VerificationCodeType)
  })
  .strict()
  .strip()

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordSchema>
export type RegisterBodyType = z.infer<typeof RegisterSchema>
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordSchema>
export type EmailParamsType = z.infer<typeof EmailParamsSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenSchema>
export type VerifyAccountBodyType = z.infer<typeof VerifyAccountSchema>
export type LoginBodyType = z.infer<typeof LoginSchema>
