import express from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  RegisterSchema,
  SendOTPBodySchema
} from '@/validation/AuthSchema'
import asyncHandler from '@/middleware/asyncHandler'
import { authMiddleware } from '@/middleware/authMiddleware'
import { resolveInstance } from '@/container'
import { AuthController } from '@/controller/AuthController'

const AuthRoute = express.Router()

AuthRoute.post('/register', validateRequest({ body: RegisterSchema }), resolveInstance(AuthController, 'register'))
AuthRoute.post('/login', validateRequest({ body: LoginSchema }), asyncHandler(resolveInstance(AuthController, 'login')))
AuthRoute.post(
  '/send-otp',
  validateRequest({ body: SendOTPBodySchema }),
  asyncHandler(resolveInstance(AuthController, 'sendOTP'))
)
AuthRoute.post(
  '/refresh-token',
  validateRequest({ body: RefreshTokenSchema }),
  asyncHandler(resolveInstance(AuthController, 'refreshToken'))
)
AuthRoute.post(
  '/reset-password',
  validateRequest({ body: ForgotPasswordSchema }),
  asyncHandler(resolveInstance(AuthController, 'forgotPassword'))
)
AuthRoute.post('/logout', authMiddleware, asyncHandler(resolveInstance(AuthController, 'logout')))
AuthRoute.post(
  '/change-password',
  authMiddleware,
  validateRequest({ body: ChangePasswordSchema }),
  asyncHandler(resolveInstance(AuthController, 'changePassword'))
)

export default AuthRoute
