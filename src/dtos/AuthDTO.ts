import z from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { BaseDTO } from './BaseDTO'

extendZodWithOpenApi(z)

export const LoginDataRes = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string()
  })
  .strip()

export const LoginRes = z
  .object({
    ...BaseDTO.shape,
    data: LoginDataRes
  })
  .strip()
  .openapi('LoginRes')

export const RefreshTokenDataRes = LoginDataRes
export const RefreshTokenRes = LoginRes
