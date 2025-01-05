import { z } from 'zod'
import { ImageType } from '@/utils/enums'

export const EmailSchema = z.string({ message: 'Email can not be blank' }).email({
  message: 'Invalid email address.'
})

export const PasswordSchema = z
  .string({ message: 'Password can not be blank' })
  .min(8, {
    message: 'Password must be at least 8 characters.'
  })
  .max(20, { message: 'Password must be at most 20 characters.' })
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d$&+,:;=?@#|'<>.^*()%!-]{8,20}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
  })

export const NameSchema = z
  .string({ message: 'Name can not be blank' })
  .min(3, { message: 'Name must be at least 3 characters.' })
  .max(20, { message: 'Name must not exceed 20 characters.' })

export const phoneNumberSchema = z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, {
  message: 'Phone number is invalid (Viet Nam phone number only).'
})

export const SendEmailSchema = z.object({
  email: EmailSchema,
  verificationToken: z.string()
})

export type SendEmailType = z.infer<typeof SendEmailSchema>

export const UsernameParamsSchema = z
  .object({
    username: z.string()
  })
  .strict()
  .strip()

export type UsernameParamsType = z.infer<typeof UsernameParamsSchema>

export const IdParamsSchema = z
  .object({
    id: z.string()
  })
  .strict()
  .strip()

export type IdParamsType = z.infer<typeof IdParamsSchema>

export const ChangeImageProfileParamsSchema = z
  .object({
    type: z.enum([ImageType.AVATAR, ImageType.COVER])
  })
  .strict()
  .strip()

export type ChangeImageProfileParamsType = z.infer<typeof ChangeImageProfileParamsSchema>

export const FilenameQuerySchema = z
  .object({
    filename: z.string()
  })
  .strict()
  .strip()

export type FilenameQueryType = z.infer<typeof FilenameQuerySchema>
