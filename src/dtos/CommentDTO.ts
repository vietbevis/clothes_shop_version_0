import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'
import { BaseDTO, MetaPagination } from './BaseDTO'

extendZodWithOpenApi(z)

export const CommentDTO = z
  .object({
    id: z.string().nonempty(),
    content: z.string().nonempty(),
    author: z
      .object({
        id: z.string().nonempty(),
        fullName: z.string().nonempty(),
        email: z.string().nonempty(),
        avatarUrl: z.string().default('')
      })
      .strip(),
    productSlug: z.string().nonempty(),
    level: z.number().default(1),
    parentId: z.string().default(''),
    isAuthor: z.boolean().default(false),
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().default(new Date())
  })
  .strip()
  .openapi('CommentDTO', {
    description: 'Comment data transfer object',
    title: 'Comment',
    example: {
      id: 'comment-id',
      content: 'This is a comment',
      productSlug: 'product-slug',
      level: 1,
      author: {
        id: 'user-id',
        fullName: 'John Doe',
        email: 'user@gmail.com',
        avatarUrl: 'https://avatar.com'
      },
      isAuthor: false,
      parentId: 'parent-comment-id',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

export const CommentRes = z.object({
  ...BaseDTO.shape,
  data: CommentDTO
})

export const PaginateCommentDTO = z
  .object({
    items: z.array(CommentDTO),
    meta: MetaPagination
  })
  .strip()

export const ListCommentRes = z.object({
  ...BaseDTO.shape,
  data: PaginateCommentDTO
})
