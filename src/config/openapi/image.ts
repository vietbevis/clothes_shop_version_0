import { ImageUploadRes, ListImageRes } from '@/dtos/ImageDTO'
import { PaginationQuerySchema } from '@/validation/CommonSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

const ImageUploadSchema = z.object({
  files: z.array(z.instanceof(File)).openapi({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
      contentMediaType: 'image/*'
    },
    minLength: 1,
    maxLength: 10
  })
})

const imageRegistry = (registry: OpenAPIRegistry) => {
  // Add image
  registry.registerPath({
    tags: ['Image'],
    method: 'post',
    path: '/v1/images',
    summary: 'Add image',
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: ImageUploadSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Image',
        content: {
          'application/json': {
            schema: ImageUploadRes
          }
        }
      }
    }
  })
  //Get list image
  registry.registerPath({
    tags: ['Image'],
    method: 'get',
    path: '/v1/images',
    summary: 'Get list image',
    request: {
      query: PaginationQuerySchema
    },
    responses: {
      200: {
        description: 'Get list image',
        content: {
          'application/json': {
            schema: ListImageRes
          }
        }
      }
    }
  })
}

export default imageRegistry
