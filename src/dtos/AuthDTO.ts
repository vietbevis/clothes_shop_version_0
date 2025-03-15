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

export const GetGoogleUrlDataRes = z
  .object({
    url: z.string()
  })
  .strip()
  .openapi('GetGoogleUrlDataRes')

export const GetGoogleUrlRes = z.object({
  ...BaseDTO.shape,
  data: GetGoogleUrlDataRes
})

export const RefreshTokenDataRes = LoginDataRes
export const RefreshTokenRes = LoginRes
