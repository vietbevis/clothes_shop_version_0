import { ApproveStatus } from '@/utils/enums'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

export const EmailSchema = z.string({ message: 'Email can not be blank' }).email({
  message: 'Invalid email address.'
})

export const PasswordSchema = z
  .string({ message: 'Password can not be blank' })
  .min(8, {
    message: 'Password must be at least 8 characters.'
  })
  .max(20, { message: 'Password must be at most 20 characters.' })
  .trim()
  .nonempty()
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[A-Za-z\d$&+,:;=?@#|'<>.^*()%!-]{8,20}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
  })

export const NameSchema = z
  .string({ message: 'Name can not be blank' })
  .min(3, { message: 'Name must be at least 3 characters.' })
  .max(20, { message: 'Name must not exceed 20 characters.' })
  .trim()
  .nonempty()

export const phoneNumberSchema = z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, {
  message: 'Phone number is invalid (Viet Nam phone number only).'
})

export const UsernameParamsSchema = z
  .object({
    username: z.string().trim().nonempty()
  })
  .strict()
  .strip()

export const IdParamsSchema = z
  .object({
    id: z.string().uuid({ message: 'Id must be a valid UUID' }).trim().nonempty()
  })
  .strict()
  .strip()

export const FilenameBodySchema = z
  .object({
    filename: z.string().trim().nonempty()
  })
  .strict()
  .strip()

export const PaginationQuerySchema = z
  .object({
    page: z
      .string()
      .default('1')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Page must be a positive number'
      })
      .transform((val) => Number(val)),
    limit: z
      .string()
      .default('24')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Limit must be a positive number'
      })
      .transform((val) => Number(val)),
    sortBy: z.string().optional(),
    sortDirection: z.string().optional()
  })
  .strict()
  .strip()
  .openapi('PaginationQuerySchema', {
    description: 'Pagination query schema',
    title: 'PaginationQuerySchema',
    example: {
      page: '1',
      limit: '24',
      sortBy: 'createdAt',
      sortDirection: 'desc'
    }
  })

export const UrlSchema = z.union([z.string().url(), z.string().length(0)]).default('')

export const SeachSchema = z
  .object({
    search: z.string().optional()
  })
  .strict()
  .strip()

export const SlugParamsSchema = z
  .object({
    slug: z.string().default('')
  })
  .strict()
  .strip()

export const ApproveQuerySchema = z
  .object({
    status: z.nativeEnum(ApproveStatus)
  })
  .strict()
  .strip()

export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>
export type UsernameParamsType = z.infer<typeof UsernameParamsSchema>
export type IdParamsType = z.infer<typeof IdParamsSchema>
export type FilenameBodyType = z.infer<typeof FilenameBodySchema>
export type SlugParamsType = z.infer<typeof SlugParamsSchema>
export type ApproveQueryType = z.infer<typeof ApproveQuerySchema>
