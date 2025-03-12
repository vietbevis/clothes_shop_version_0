import { BaseDTO } from '@/dtos/BaseDTO'
import { CommentRes, ListCommentRes } from '@/dtos/CommentDTO'
import { CreateCommentSchema, UpdateCommentSchema } from '@/validation/CommentSchema'
import { IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const commentRegistry = (registry: OpenAPIRegistry) => {
  // Create comment
  registry.registerPath({
    tags: ['Comments'],
    method: 'post',
    path: '/v1/comments',
    summary: 'Create comment',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateCommentSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Comment',
        content: {
          'application/json': {
            schema: CommentRes
          }
        }
      }
    }
  })
  // Get comment by product slug
  registry.registerPath({
    tags: ['Comments'],
    method: 'get',
    path: '/v1/comments/{slug}',
    summary: 'Get comment by product slug',
    request: {
      params: SlugParamsSchema
    },
    responses: {
      200: {
        description: 'Comment',
        content: {
          'application/json': {
            schema: ListCommentRes
          }
        }
      }
    }
  })
  // Get comment replies
  registry.registerPath({
    tags: ['Comments'],
    method: 'get',
    path: '/v1/comments/{id}/replies',
    summary: 'Get comment replies',
    request: {
      params: IdParamsSchema
    },
    responses: {
      200: {
        description: 'Comment',
        content: {
          'application/json': {
            schema: ListCommentRes
          }
        }
      }
    }
  })
  // Update comment
  registry.registerPath({
    tags: ['Comments'],
    method: 'put',
    path: '/v1/comments/{id}',
    summary: 'Update comment',
    request: {
      params: IdParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: UpdateCommentSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Comment',
        content: {
          'application/json': {
            schema: CommentRes
          }
        }
      }
    }
  })
  // Delete comment
  registry.registerPath({
    tags: ['Comments'],
    method: 'delete',
    path: '/v1/comments/{id}',
    summary: 'Delete comment',
    request: {
      params: IdParamsSchema
    },
    responses: {
      200: {
        description: 'Comment',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
}

export default commentRegistry
