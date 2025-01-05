import express from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import {
  ChangePasswordSchema,
  EmailParamsSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  RegisterSchema,
  VerifyAccountSchema
} from '@/validation/AuthSchema'
import asyncHandler from '@/middleware/asyncHandler'
import authController from '@/controller/AuthController'
import { authMiddleware } from '@/middleware/authMiddleware'

const AuthRoute = express.Router()

// Public routes
AuthRoute.post('/register', validateRequest({ body: RegisterSchema }), asyncHandler(authController.register))
AuthRoute.post('/login', validateRequest({ body: LoginSchema }), asyncHandler(authController.login))
AuthRoute.post(
  '/verify-account',
  validateRequest({ body: VerifyAccountSchema }),
  asyncHandler(authController.verifyAccount)
)
AuthRoute.post(
  '/refresh-token',
  validateRequest({ body: RefreshTokenSchema }),
  asyncHandler(authController.refreshToken)
)
AuthRoute.post(
  '/forgot-password',
  validateRequest({ body: ForgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
)
AuthRoute.get(
  '/forgot-password/:email',
  validateRequest({ params: EmailParamsSchema }),
  asyncHandler(authController.sendEmailForgotPassword)
)

// Private routes
AuthRoute.post('/logout', authMiddleware, asyncHandler(authController.logout))
AuthRoute.post(
  '/change-password',
  authMiddleware,
  validateRequest({ body: ChangePasswordSchema }),
  asyncHandler(authController.changePassword)
)

// Admin routes

export default AuthRoute
