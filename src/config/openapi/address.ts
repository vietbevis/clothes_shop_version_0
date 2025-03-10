import { AddressRes, ListAddressRes } from '@/dtos/AddressDTO'
import { BaseDTO } from '@/dtos/BaseDTO'
import { AddressSchema, UpdateAddressSchema } from '@/validation/AddressSchema'
import { IdParamsSchema } from '@/validation/CommonSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const addressRegistry = (registry: OpenAPIRegistry) => {
  // Add address
  registry.registerPath({
    tags: ['Address'],
    method: 'post',
    path: '/v1/address',
    summary: 'Add address',
    request: {
      body: {
        content: {
          'application/json': {
            schema: AddressSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Address',
        content: {
          'application/json': {
            schema: AddressRes
          }
        }
      }
    }
  })
  // Get list address
  registry.registerPath({
    tags: ['Address'],
    method: 'get',
    path: '/v1/address',
    summary: 'Get list address',
    responses: {
      200: {
        description: 'Get list address',
        content: {
          'application/json': {
            schema: ListAddressRes
          }
        }
      }
    }
  })
  // Get address by id
  registry.registerPath({
    tags: ['Address'],
    method: 'get',
    path: '/v1/address/{id}',
    summary: 'Get address by id',
    request: {
      params: IdParamsSchema
    },
    responses: {
      200: {
        description: 'Address',
        content: {
          'application/json': {
            schema: AddressRes
          }
        }
      }
    }
  })
  // Update address
  registry.registerPath({
    tags: ['Address'],
    method: 'put',
    path: '/v1/address/{id}',
    summary: 'Update address',
    request: {
      params: IdParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: UpdateAddressSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Address',
        content: {
          'application/json': {
            schema: AddressRes
          }
        }
      }
    }
  })
  // Delete address
  registry.registerPath({
    tags: ['Address'],
    method: 'delete',
    path: '/v1/address/{id}',
    summary: 'Delete address',
    request: {
      params: IdParamsSchema
    },
    responses: {
      200: {
        description: 'Address',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
  // Set default address
  registry.registerPath({
    tags: ['Address'],
    method: 'put',
    path: '/v1/address/{id}/set-default',
    summary: 'Set default address',
    request: {
      params: IdParamsSchema
    },
    responses: {
      200: {
        description: 'Address',
        content: {
          'application/json': {
            schema: ListAddressRes
          }
        }
      }
    }
  })
}

export default addressRegistry
