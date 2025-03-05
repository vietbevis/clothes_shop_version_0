import { z } from 'zod'

export const CreateCategorySchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().optional(),
    parentId: z.string().optional(),
    image: z.string().optional()
  })
  .strict()
  .strip()

export const UpdateCategorySchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().optional(),
    image: z.string().optional()
  })
  .strict()
  .strip()

export type UpdateCategoryType = z.infer<typeof UpdateCategorySchema>
export type CreateCategoryType = z.infer<typeof CreateCategorySchema>
