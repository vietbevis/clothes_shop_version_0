import { resolveController } from '@/container'
import { ChatController } from '@/controller/ChatController'
import { authMiddleware } from '@/middleware/authMiddleware'
import { validateRequest } from '@/middleware/validateRequest'
import { IdParamsSchema, PaginationQuerySchema } from '@/validation/CommonSchema'
import { CreateMessageSchema, GetConversationQuerySchema, UpdateMessageSchema } from '@/validation/MessageSchema'
import { Router } from 'express'

const ChatRoute = Router()

ChatRoute.get(
  '/conversations',
  validateRequest({ query: GetConversationQuerySchema }),
  authMiddleware,
  resolveController(ChatController, 'getConversations')
)
ChatRoute.post(
  '/messages',
  validateRequest({ body: CreateMessageSchema }),
  authMiddleware,
  resolveController(ChatController, 'createMessage')
)
ChatRoute.get(
  '/messages/:id',
  validateRequest({ params: IdParamsSchema, query: PaginationQuerySchema }),
  authMiddleware,
  resolveController(ChatController, 'getMessages')
)
ChatRoute.put(
  '/messages/:id',
  validateRequest({ params: IdParamsSchema, body: UpdateMessageSchema }),
  authMiddleware,
  resolveController(ChatController, 'updateMessage')
)
ChatRoute.delete(
  '/messages/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveController(ChatController, 'deleteMessage')
)
ChatRoute.post(
  '/messages/:id/read',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveController(ChatController, 'readMessages')
)

export default ChatRoute
