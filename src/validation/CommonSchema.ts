import { z } from 'zod'
import { ApproveStatus, ESort, Gender, ImageType } from '@/utils/enums'

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

export const FilenameBodySchema = z
  .object({
    filename: z.string()
  })
  .strict()
  .strip()

export type FilenameBodyType = z.infer<typeof FilenameBodySchema>

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
    sortBy: z.enum(['createdAt', 'updatedAt']).optional(),
    sortDirection: z.nativeEnum(ESort).optional()
  })
  .strict()
  .strip()

export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>

export const GetImagesQuerySchema = PaginationQuerySchema.extend({
  type: z.nativeEnum(ImageType).optional()
})
  .strict()
  .strip()

export type GetImageQueryType = z.infer<typeof GetImagesQuerySchema>

export const UpdateProfileSchema = z
  .object({
    gender: z.nativeEnum(Gender).optional(),
    dateOfBirth: z.string().date().optional(),
    bio: z.string().optional(),
    phone: phoneNumberSchema.optional(),
    website: z.string().url().optional(),
    facebookUrl: z.string().url().optional(),
    twitterUrl: z.string().url().optional(),
    instagramUrl: z.string().url().optional()
  })
  .strict()
  .strip()

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>

export const DepthQuerySchema = z
  .object({
    depth: z
      .string()
      .default('1')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Limit must be a positive number'
      })
      .transform((val) => Number(val))
  })
  .strict()
  .strip()

export type DepthQueryType = z.infer<typeof DepthQuerySchema>

export const GetCategoriesSchema = PaginationQuerySchema.extend({
  name: z.string().optional(),
  parentId: z.string().optional()
})
  .strict()
  .strip()

export const SlugParamsSchema = z
  .object({
    slug: z.string().nonempty()
  })
  .strict()
  .strip()

export type SlugParamsType = z.infer<typeof SlugParamsSchema>

export const ApproveQuerySchema = z
  .object({
    status: z.nativeEnum(ApproveStatus)
  })
  .strict()
  .strip()

export type ApproveQueryType = z.infer<typeof ApproveQuerySchema>

export const GetProductPaginationQuerySchema = PaginationQuerySchema.extend({
  name: z.string().optional()
})
  .strict()
  .strip()

export type GetProductPaginationQueryType = z.infer<typeof GetProductPaginationQuerySchema>
