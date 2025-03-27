import express from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  GoogleLoginSchema,
  LoginSchema,
  RefreshTokenSchema,
  RegisterSchema,
  SendOTPBodySchema
} from '@/validation/AuthSchema'
import { authMiddleware } from '@/middleware/authMiddleware'
import { resolveController } from '@/container'
import { AuthController } from '@/controller/AuthController'

const AuthRoute = express.Router()

AuthRoute.get('/check', authMiddleware, resolveController(AuthController, 'checkAuth'))
AuthRoute.post('/register', validateRequest({ body: RegisterSchema }), resolveController(AuthController, 'register'))
AuthRoute.post('/login', validateRequest({ body: LoginSchema }), resolveController(AuthController, 'login'))
AuthRoute.post('/send-otp', validateRequest({ body: SendOTPBodySchema }), resolveController(AuthController, 'sendOTP'))
AuthRoute.post(
  '/refresh-token',
  validateRequest({ body: RefreshTokenSchema }),
  resolveController(AuthController, 'refreshToken')
)
AuthRoute.post(
  '/reset-password',
  validateRequest({ body: ForgotPasswordSchema }),
  resolveController(AuthController, 'forgotPassword')
)
AuthRoute.post('/logout', authMiddleware, resolveController(AuthController, 'logout'))
AuthRoute.post(
  '/change-password',
  authMiddleware,
  validateRequest({ body: ChangePasswordSchema }),
  resolveController(AuthController, 'changePassword')
)
AuthRoute.post(
  '/google-login',
  validateRequest({ body: GoogleLoginSchema }),
  resolveController(AuthController, 'googleLogin')
)

export default AuthRoute
