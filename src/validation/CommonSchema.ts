import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { ApproveStatus, Gender, ImageType } from '@/utils/enums'

extendZodWithOpenApi(z)

export const EmailSchema = z
  .string({ message: 'Email can not be blank' })
  .email({
    message: 'Invalid email address.'
  })
  .openapi({ description: 'Email address', title: 'Email' })

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
  .openapi({ description: 'Password', title: 'Password' })

export const NameSchema = z
  .string({ message: 'Name can not be blank' })
  .min(3, { message: 'Name must be at least 3 characters.' })
  .max(20, { message: 'Name must not exceed 20 characters.' })
  .openapi({ description: 'Name', title: 'Name' })

export const phoneNumberSchema = z
  .string()
  .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, {
    message: 'Phone number is invalid (Viet Nam phone number only).'
  })
  .openapi({ description: 'Phone number', title: 'Phone', example: '0987654321' })

export const SendEmailSchema = z
  .object({
    email: EmailSchema,
    verificationToken: z.string()
  })
  .openapi({ description: 'Send email schema', title: 'SendEmail' })

export const UsernameParamsSchema = z
  .object({
    username: z.string()
  })
  .strict()
  .strip()
  .openapi({ description: 'Username params', title: 'UsernameParams' })

export const IdParamsSchema = z
  .object({
    id: z.string()
  })
  .strict()
  .strip()
  .openapi({ description: 'Id params', title: 'IdParams' })

export const ChangeImageProfileParamsSchema = z
  .object({
    type: z.enum([ImageType.AVATAR, ImageType.COVER])
  })
  .strict()
  .strip()
  .openapi({ description: 'Type of image', title: 'ChangeImageProfileParams' })

export const FilenameBodySchema = z
  .object({
    filename: z.string()
  })
  .strict()
  .strip()
  .openapi({ description: 'Filename of image', title: 'FilenameBody' })

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
  .openapi({ description: 'Pagination query', title: 'PaginationQuery' })

export const GetImagesQuerySchema = z
  .object({
    ...PaginationQuerySchema.shape,
    type: z.nativeEnum(ImageType).optional()
  })
  .strict()
  .strip()
  .openapi({ description: 'Get images query', title: 'GetImagesQuery' })

export const UrlSchema = z.union([z.string().url(), z.string().length(0)]).default('')

export const UpdateProfileSchema = z
  .object({
    fullName: z.string().nonempty(),
    avatarUrl: z.string().default(''),
    coverPhotoUrl: z.string().default(''),
    gender: z.nativeEnum(Gender).default(Gender.OTHER),
    dateOfBirth: z.string().date().optional(),
    bio: z.string().default(''),
    phone: phoneNumberSchema,
    website: UrlSchema,
    facebookUrl: UrlSchema,
    twitterUrl: UrlSchema,
    instagramUrl: UrlSchema
  })
  .strict()
  .strip()
  .openapi({ description: 'Update profile schema', title: 'UpdateProfile' })

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
  .openapi({ description: 'Depth query', title: 'DepthQuery' })

export const GetCategoriesSchema = z
  .object({
    ...PaginationQuerySchema.shape,
    name: z.string().optional(),
    parentId: z.string().optional()
  })
  .strict()
  .strip()
  .openapi({ description: 'Get categories query', title: 'GetCategories' })

export const SeachSchema = z
  .object({
    search: z.string().optional()
  })
  .strict()
  .strip()
  .openapi({ description: 'Search query', title: 'Search' })

export const SlugParamsSchema = z
  .object({
    slug: z.string().default('')
  })
  .strict()
  .strip()
  .openapi({ description: 'Slug params', title: 'SlugParams' })

export const ApproveQuerySchema = z
  .object({
    status: z.nativeEnum(ApproveStatus)
  })
  .strict()
  .strip()
  .openapi({ description: 'Approve query', title: 'ApproveQuery' })

export const GetProductPaginationQuerySchema = z
  .object({
    ...PaginationQuerySchema.shape,
    name: z.string().optional(),
    shopSlug: z.string().optional(),
    categoryId: z.string().optional()
  })
  .strict()
  .strip()
  .openapi({ description: 'Get product pagination query', title: 'GetProductPaginationQuery' })

export type GetProductPaginationQueryType = z.infer<typeof GetProductPaginationQuerySchema>
export type GetImageQueryType = z.infer<typeof GetImagesQuerySchema>
export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>
export type SendEmailType = z.infer<typeof SendEmailSchema>
export type UsernameParamsType = z.infer<typeof UsernameParamsSchema>
export type IdParamsType = z.infer<typeof IdParamsSchema>
export type ChangeImageProfileParamsType = z.infer<typeof ChangeImageProfileParamsSchema>
export type FilenameBodyType = z.infer<typeof FilenameBodySchema>
export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>
export type DepthQueryType = z.infer<typeof DepthQuerySchema>
export type SlugParamsType = z.infer<typeof SlugParamsSchema>
export type ApproveQueryType = z.infer<typeof ApproveQuerySchema>
