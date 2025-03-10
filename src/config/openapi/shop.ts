import { BaseDTO } from '@/dtos/BaseDTO'
import { ListShopRes, ShopRes } from '@/dtos/ShopDTO'
import {
  ApproveQuerySchema,
  IdParamsSchema,
  PaginationQuerySchema,
  SeachSchema,
  SlugParamsSchema
} from '@/validation/CommonSchema'
import { CreateShopSchema, UpdateShopSchema } from '@/validation/ShopSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const shopRegistry = (registry: OpenAPIRegistry) => {
  // Create Shop
  registry.registerPath({
    tags: ['Shop'],
    method: 'post',
    path: '/v1/shops',
    summary: 'Create Shop',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateShopSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Create Shop',
        content: {
          'application/json': {
            schema: ShopRes
          }
        }
      }
    }
  })
  // Get Shop List
  registry.registerPath({
    tags: ['Shop'],
    method: 'get',
    path: '/v1/shops',
    summary: 'Get Shop List',
    request: {
      query: SeachSchema.merge(PaginationQuerySchema)
    },
    responses: {
      200: {
        description: 'Get Shop',
        content: {
          'application/json': {
            schema: ListShopRes
          }
        }
      }
    }
  })
  // Get Shop By Slug
  registry.registerPath({
    tags: ['Shop'],
    method: 'get',
    path: '/v1/shops/{slug}',
    summary: 'Get Shop By Slug',
    request: {
      params: SlugParamsSchema
    },
    responses: {
      200: {
        description: 'Get Shop By Slug',
        content: {
          'application/json': {
            schema: ShopRes
          }
        }
      }
    }
  })
  // Update Shop
  registry.registerPath({
    tags: ['Shop'],
    method: 'put',
    path: '/v1/shops',
    summary: 'Update Shop',
    request: {
      body: {
        content: {
          'application/json': {
            schema: UpdateShopSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Update Shop',
        content: {
          'application/json': {
            schema: ShopRes
          }
        }
      }
    }
  })
  // Approve Shop
  registry.registerPath({
    tags: ['Shop'],
    method: 'put',
    path: '/v1/shops/{id}/approve',
    summary: 'Approve Shop',
    request: { params: IdParamsSchema, query: ApproveQuerySchema },
    responses: {
      200: {
        description: 'Approve Shop',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
}

export default shopRegistry
