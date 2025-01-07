import { z } from 'zod'

export const CreateCategorySchema = z
  .object({
    name: z.string().nonempty(),
    parentId: z.string().optional(),
    imageFilename: z.string().optional()
  })
  .strict()
  .strip()

export type CreateCategoryType = z.infer<typeof CreateCategorySchema>
