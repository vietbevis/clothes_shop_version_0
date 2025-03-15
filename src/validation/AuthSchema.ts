import { EmailSchema, NameSchema, PasswordSchema } from '@/validation/CommonSchema'
import { VerificationCodeType } from '@/utils/enums'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

export const RegisterSchema = z
  .object({
    fullName: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    otp: z.string().regex(/^\d{6}$/, 'The otp must be exactly 6 digits')
  })
  .strict()
  .strip()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password does not match.',
    path: ['confirmPassword']
  })
  .openapi('RegisterSchema', {
    description: 'Register schema',
    title: 'RegisterSchema',
    example: {
      fullName: 'John Doe',
      email: 'user@gmail.com',
      password: 'Abc@1234',
      confirmPassword: 'Abc@1234',
      otp: '123456'
    }
  })

export const LoginSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    deviceId: z.string().min(3).max(255)
  })
  .strict()
  .strip()
  .openapi('LoginSchema', {
    description: 'Login schema',
    title: 'LoginSchema',
    example: {
      email: 'user@gmail.com',
      password: 'Abc@1234',
      deviceId: '01956421-5968-7509-b7aa-6eb26473d489'
    }
  })

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string()
  })
  .strict()
  .strip()
  .openapi('RefreshTokenSchema', {
    description: 'Refresh token schema',
    title: 'RefreshTokenSchema',
    example: {
      refreshToken: 'eyJhbGciOiJSUzI1...'
    }
  })

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
  .openapi('ForgotPasswordSchema', {
    description: 'Forgot password schema',
    title: 'ForgotPasswordSchema',
    example: {
      email: 'user@gmail.com',
      otp: '123456',
      newPassword: 'Abc@1234',
      confirmNewPassword: 'Abc@1234'
    }
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
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword']
  })
  .openapi('ChangePasswordSchema', {
    description: 'Change password schema',
    title: 'ChangePasswordSchema',
    example: {
      currentPassword: 'Abc@1234',
      newPassword: 'Abc@1234',
      confirmNewPassword: 'Abc@1234'
    }
  })

export const SendOTPBodySchema = z
  .object({
    email: EmailSchema,
    type: z.nativeEnum(VerificationCodeType)
  })
  .strict()
  .strip()
  .openapi('SendOTPBodySchema', {
    description: 'Send OTP schema',
    title: 'SendOTPBodySchema',
    example: {
      email: 'user@gmail.com',
      type: VerificationCodeType.REGISTER
    }
  })

export const SendEmailSchema = z
  .object({
    email: EmailSchema,
    verificationToken: z.string()
  })
  .strict()
  .strip()
  .openapi('SendEmailSchema', {
    description: 'Send email schema',
    title: 'SendEmailSchema',
    example: {
      email: 'user@gmail.com',
      verificationToken: '123456'
    }
  })

export type SendEmailType = z.infer<typeof SendEmailSchema>
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordSchema>
export type RegisterBodyType = z.infer<typeof RegisterSchema>
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenSchema>
export type LoginBodyType = z.infer<typeof LoginSchema>
