import { resolveController } from '@/container'
import { CommentController } from '@/controller/CommentController'
import { authMiddleware, authMiddlewareOptional } from '@/middleware/authMiddleware'
import { validateRequest } from '@/middleware/validateRequest'
import { CreateCommentSchema, UpdateCommentSchema } from '@/validation/CommentSchema'
import { IdParamsSchema, PaginationQuerySchema, SlugParamsSchema } from '@/validation/CommonSchema'
import { Router } from 'express'

const CommentRoute = Router()

CommentRoute.get(
  '/:slug',
  validateRequest({ query: PaginationQuerySchema, params: SlugParamsSchema }),
  authMiddlewareOptional,
  resolveController(CommentController, 'getCommentByProductSlug')
)
CommentRoute.get(
  '/:id/replies',
  validateRequest({ query: PaginationQuerySchema, params: IdParamsSchema }),
  authMiddlewareOptional,
  resolveController(CommentController, 'getCommentReplies')
)
CommentRoute.post(
  '/',
  validateRequest({ body: CreateCommentSchema }),
  authMiddleware,
  resolveController(CommentController, 'createComment')
)
CommentRoute.put(
  '/:id',
  validateRequest({ body: UpdateCommentSchema, params: IdParamsSchema }),
  authMiddleware,
  resolveController(CommentController, 'updateComment')
)
CommentRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveController(CommentController, 'deleteComment')
)

export default CommentRoute
