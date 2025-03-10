import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

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
  .openapi('CreateCategorySchema')

export const UpdateCategorySchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().optional(),
    image: z.string().optional()
  })
  .strict()
  .strip()
  .openapi('UpdateCategorySchema')

export type UpdateCategoryType = z.infer<typeof UpdateCategorySchema>
export type CreateCategoryType = z.infer<typeof CreateCategorySchema>
