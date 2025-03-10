import { LoginRes, RefreshTokenRes } from '@/dtos/AuthDTO'
import { BaseDTO } from '@/dtos/BaseDTO'
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  RegisterSchema,
  SendOTPBodySchema
} from '@/validation/AuthSchema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

const authRegistry = (registry: OpenAPIRegistry) => {
  // Login
  registry.registerPath({
    tags: ['Auth'],
    method: 'post',
    path: '/v1/auth/login',
    summary: 'Login',
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Login',
        content: {
          'application/json': {
            schema: LoginRes
          }
        }
      }
    }
  })
  // Send OTP
  registry.registerPath({
    tags: ['Auth'],
    method: 'post',
    path: '/v1/auth/send-otp',
    summary: 'Send OTP to email (Register, Forgot Password)',
    request: {
      body: {
        content: {
          'application/json': {
            schema: SendOTPBodySchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Send OTP',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
  // Register
  registry.registerPath({
    tags: ['Auth'],
    method: 'post',
    path: '/v1/auth/register',
    summary: 'Register',
    request: {
      body: {
        content: {
          'application/json': {
            schema: RegisterSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Register',
        content: {
          'application/json': {
            schema: LoginRes
          }
        }
      }
    }
  })
  // Refresh Token
  registry.registerPath({
    tags: ['Auth'],
    method: 'post',
    path: '/v1/auth/refresh-token',
    summary: 'Refresh Token',
    request: {
      body: {
        content: {
          'application/json': {
            schema: RefreshTokenSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Refresh Token',
        content: {
          'application/json': {
            schema: RefreshTokenRes
          }
        }
      }
    }
  })
  // Forgot Password
  registry.registerPath({
    tags: ['Auth'],
    method: 'post',
    path: '/v1/auth/reset-password',
    summary: 'Forgot Password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: ForgotPasswordSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Forgot Password',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
  // Change Password
  registry.registerPath({
    tags: ['Auth'],
    method: 'post',
    path: '/v1/auth/change-password',
    summary: 'Change Password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: ChangePasswordSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Forgot Password',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
  // Logout
  registry.registerPath({
    tags: ['Auth'],
    method: 'post',
    path: '/v1/auth/logout',
    summary: 'Logout',
    responses: {
      200: {
        description: 'Logout',
        content: {
          'application/json': {
            schema: BaseDTO
          }
        }
      }
    }
  })
}

export default authRegistry
