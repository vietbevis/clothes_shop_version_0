import express from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import {
  ChangePasswordSchema,
  EmailParamsSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  RegisterSchema,
  SendOTPBodySchema,
  VerifyAccountSchema
} from '@/validation/AuthSchema'
import asyncHandler from '@/middleware/asyncHandler'
import authController from '@/controller/AuthController'
import { authMiddleware } from '@/middleware/authMiddleware'

const AuthRoute = express.Router()

AuthRoute.post('/register', validateRequest({ body: RegisterSchema }), asyncHandler(authController.register))
AuthRoute.post('/login', validateRequest({ body: LoginSchema }), asyncHandler(authController.login))
AuthRoute.post('/send-otp', validateRequest({ body: SendOTPBodySchema }), asyncHandler(authController.sendOTP))
AuthRoute.post(
  '/refresh-token',
  validateRequest({ body: RefreshTokenSchema }),
  asyncHandler(authController.refreshToken)
)
AuthRoute.post(
  '/reset-password',
  validateRequest({ body: ForgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
)
AuthRoute.post('/logout', authMiddleware, asyncHandler(authController.logout))
AuthRoute.post(
  '/change-password',
  authMiddleware,
  validateRequest({ body: ChangePasswordSchema }),
  asyncHandler(authController.changePassword)
)

export default AuthRoute
