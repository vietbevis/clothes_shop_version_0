import { UserRes } from '@/dtos/UserDTO'
import { UpdateProfileSchema, UsernameParamsSchema } from '@/validation/CommonSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const userRegistry = (registry: OpenAPIRegistry) => {
  // Get Me
  registry.registerPath({
    tags: ['User'],
    method: 'get',
    path: '/v1/users/me',
    summary: 'Get Me',
    responses: {
      200: {
        description: 'Get Me',
        content: {
          'application/json': {
            schema: UserRes
          }
        }
      }
    }
  })
  // Get User By Username
  registry.registerPath({
    tags: ['User'],
    method: 'get',
    path: '/v1/users/{username}',
    summary: 'Get User By Username',
    request: {
      params: UsernameParamsSchema
    },
    responses: {
      200: {
        description: 'Get User By Username',
        content: {
          'application/json': {
            schema: UserRes
          }
        }
      }
    }
  })
  //Update Profile
  registry.registerPath({
    tags: ['User'],
    method: 'put',
    path: '/v1/users/update-profile',
    summary: 'Update Profile',
    request: {
      body: {
        content: {
          'application/json': {
            schema: UpdateProfileSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Update Profile',
        content: {
          'application/json': {
            schema: UserRes
          }
        }
      }
    }
  })
}

export default userRegistry
