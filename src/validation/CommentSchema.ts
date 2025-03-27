import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

export const CreateCommentSchema = z
  .object({
    content: z.string().trim().nonempty(),
    productSlug: z.string().trim().nonempty(),
    parentId: z.string().default('')
  })
  .openapi('CreateCommentSchema', {
    description: 'Create comment schema',
    title: 'CreateComment',
    example: {
      content: 'This is a comment',
      productSlug: 'product-slug',
      parentId: 'parent-comment-id'
    }
  })

export const UpdateCommentSchema = CreateCommentSchema.pick({ content: true }).openapi('UpdateCommentSchema', {
  description: 'Update comment schema',
  title: 'UpdateComment',
  example: {
    content: 'This is a comment'
  }
})

export type CreateCommentType = z.infer<typeof CreateCommentSchema>
export type UpdateCommentType = z.infer<typeof UpdateCommentSchema>
