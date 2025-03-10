import { BaseDTO } from '@/dtos/BaseDTO'
import { CategoryRes, ListCategoryRes } from '@/dtos/CategoryDTO'
import { CreateCategorySchema, GetCategoriesSchema, UpdateCategorySchema } from '@/validation/CategorySchema'
import { IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const categoryRegistry = (registry: OpenAPIRegistry) => {
  // Create
  registry.registerPath({
    tags: ['Categories'],
    method: 'post',
    path: '/v1/categories',
    summary: 'Create category',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateCategorySchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Category',
        content: {
          'application/json': {
            schema: CategoryRes
          }
        }
      }
    }
  })
  // List
  registry.registerPath({
    tags: ['Categories'],
    method: 'get',
    path: '/v1/categories',
    summary: 'Get all categories',
    request: {
      query: GetCategoriesSchema
    },
    responses: {
      200: {
        description: 'List of categories',
        content: {
          'application/json': {
            schema: ListCategoryRes
          }
        }
      }
    }
  })
  // Get by slug
  registry.registerPath({
    tags: ['Categories'],
    method: 'get',
    path: '/v1/categories/{slug}',
    summary: 'Get category by slug',
    request: {
      params: SlugParamsSchema
    },
    responses: {
      200: {
        description: 'Category',
        content: {
          'application/json': {
            schema: CategoryRes
          }
        }
      }
    }
  })
  // Update by id
  registry.registerPath({
    tags: ['Categories'],
    method: 'put',
    path: '/v1/categories/{id}',
    summary: 'Update category',
    request: {
      params: IdParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: UpdateCategorySchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Category',
        content: {
          'application/json': {
            schema: CategoryRes
          }
        }
      }
    }
  })
  // Delete
  registry.registerPath({
    tags: ['Categories'],
    method: 'delete',
    path: '/v1/categories/{id}',
    summary: 'Delete category',
    request: {
      params: IdParamsSchema
    },
    responses: {
      200: {
        description: 'Category',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
}

export default categoryRegistry
