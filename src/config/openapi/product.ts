import { ListProductRes, ProductRes } from '@/dtos/ProductDTO'
import { GetProductPaginationQuerySchema, IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'
import { ProductSchema } from '@/validation/ProductSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const productRegistry = (registry: OpenAPIRegistry) => {
  // Add product
  registry.registerPath({
    tags: ['Product'],
    method: 'post',
    path: '/v1/products',
    summary: 'Add product',
    request: {
      body: {
        content: {
          'application/json': {
            schema: ProductSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Product',
        content: {
          'application/json': {
            schema: ProductRes
          }
        }
      }
    }
  })
  // Update product by id
  registry.registerPath({
    tags: ['Product'],
    method: 'put',
    path: '/v1/products/{id}',
    summary: 'Update product by id',
    request: {
      params: IdParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: ProductSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Product',
        content: {
          'application/json': {
            schema: ProductRes
          }
        }
      }
    }
  })
  // Get product by slug
  registry.registerPath({
    tags: ['Product'],
    method: 'get',
    path: '/v1/products/{slug}',
    summary: 'Get product by slug',
    request: {
      params: SlugParamsSchema
    },
    responses: {
      200: {
        description: 'Product',
        content: {
          'application/json': {
            schema: ProductRes
          }
        }
      }
    }
  })
  // Get products
  registry.registerPath({
    tags: ['Product'],
    method: 'get',
    path: '/v1/products',
    summary: 'Get products',
    request: {
      query: GetProductPaginationQuerySchema
    },
    responses: {
      200: {
        description: 'Product',
        content: {
          'application/json': {
            schema: ListProductRes
          }
        }
      }
    }
  })
}

export default productRegistry
