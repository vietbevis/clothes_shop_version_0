import { BaseDTO } from '@/dtos/BaseDTO'
import { ConversationsRes, ListMessageRes, MessagesRes } from '@/dtos/ChatDTO'
import { IdParamsSchema, PaginationQuerySchema } from '@/validation/CommonSchema'
import { CreateMessageSchema } from '@/validation/MessageSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const chatRegistry = (registry: OpenAPIRegistry) => {
  // Get conversations
  registry.registerPath({
    tags: ['Chat'],
    method: 'get',
    path: '/v1/chat/conversations',
    summary: 'Get conversations',
    request: {
      query: PaginationQuerySchema
    },
    responses: {
      200: {
        description: 'Get conversations',
        content: {
          'application/json': {
            schema: ConversationsRes
          }
        }
      }
    }
  })

  // Get messages
  registry.registerPath({
    tags: ['Chat'],
    method: 'get',
    path: '/v1/chat/messages/{id}',
    summary: 'Get messages',
    request: {
      query: PaginationQuerySchema,
      params: IdParamsSchema
    },
    responses: {
      200: {
        description: 'Get messages',
        content: {
          'application/json': {
            schema: ListMessageRes
          }
        }
      }
    }
  })

  // Send message
  registry.registerPath({
    tags: ['Chat'],
    method: 'post',
    path: '/v1/chat/messages',
    summary: 'Send message',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateMessageSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Message sent',
        content: {
          'application/json': {
            schema: MessagesRes
          }
        }
      }
    }
  })

  // Read message
  registry.registerPath({
    tags: ['Chat'],
    method: 'post',
    path: '/v1/chat/messages/{id}/read',
    summary: 'Read message',
    request: {
      params: IdParamsSchema
    },
    responses: {
      200: {
        description: 'Message read',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
}

export default chatRegistry
