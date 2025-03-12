import { resolveInstance } from '@/container'
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
  resolveInstance(CommentController, 'getCommentByProductSlug')
)
CommentRoute.get(
  '/:id/replies',
  validateRequest({ query: PaginationQuerySchema, params: IdParamsSchema }),
  authMiddlewareOptional,
  resolveInstance(CommentController, 'getCommentReplies')
)
CommentRoute.post(
  '/',
  validateRequest({ body: CreateCommentSchema }),
  authMiddleware,
  resolveInstance(CommentController, 'createComment')
)
CommentRoute.put(
  '/:id',
  validateRequest({ body: UpdateCommentSchema, params: IdParamsSchema }),
  authMiddleware,
  resolveInstance(CommentController, 'updateComment')
)
CommentRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveInstance(CommentController, 'deleteComment')
)

export default CommentRoute
