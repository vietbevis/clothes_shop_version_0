import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'
import { PaginationQuerySchema } from './CommonSchema'

extendZodWithOpenApi(z)

export const CreateCategorySchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().optional(),
    parentId: z.string().optional(),
    image: z.string().optional()
  })
  .strict()
  .strip()
  .openapi('CreateCategorySchema', {
    description: 'Create category schema',
    title: 'CreateCategory',
    example: {
      name: 'Thiết bị điện tử',
      description: 'Thiết bị điện tử',
      parentId: '',
      image: '01957fa49d7b74aa8ed07288a3b00214.webp'
    }
  })

export const UpdateCategorySchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().optional(),
    image: z.string().optional()
  })
  .strict()
  .strip()
  .openapi('UpdateCategorySchema', {
    description: 'Update category schema',
    title: 'UpdateCategory',
    example: {
      name: 'Thiết bị điện tử',
      description: 'Thiết bị điện tử',
      image: '01957fa49d7b74aa8ed07288a3b00214.webp'
    }
  })

export const GetCategoriesSchema = z
  .object({
    ...PaginationQuerySchema.shape,
    name: z.string().optional(),
    parentId: z.string().optional()
  })
  .strict()
  .strip()

export type UpdateCategoryType = z.infer<typeof UpdateCategorySchema>
export type CreateCategoryType = z.infer<typeof CreateCategorySchema>
