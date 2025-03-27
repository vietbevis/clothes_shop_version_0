import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'
import { PaginationQuerySchema } from './CommonSchema'

extendZodWithOpenApi(z)

export const CreateMessageSchema = z
  .object({
    content: z.string().min(1).max(1000).trim().nonempty(),
    receiverId: z.string().uuid({ message: 'Invalid receiver ID' }).trim().nonempty(),
    images: z.array(z.string()).optional()
  })
  .strict()
  .strip()
  .openapi('CreateMessageSchema', {
    description: 'Create message schema',
    title: 'CreateMessageSchema',
    example: {
      content: 'Hello',
      receiverId: '01956421-5968-7509-b7aa-6eb26473d489',
      images: ['https://example.com/image.jpg']
    }
  })

export const UpdateMessageSchema = z
  .object({
    content: z.string().min(1).max(1000).optional(),
    images: z.array(z.string()).optional()
  })
  .strict()
  .strip()
  .openapi('UpdateMessageSchema', {
    description: 'Update message schema',
    title: 'UpdateMessageSchema',
    example: {
      content: 'Hello',
      images: ['https://example.com/image.jpg']
    }
  })

export const GetConversationQuerySchema = z.object({
  search: z.string().optional(),
  ...PaginationQuerySchema.omit({ sortBy: true, sortDirection: true }).shape
})

export type CreateMessageType = z.infer<typeof CreateMessageSchema>
export type UpdateMessageType = z.infer<typeof UpdateMessageSchema>
