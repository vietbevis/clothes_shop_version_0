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
/**
 * @openapi
 * /v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: Successful registration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
AuthRoute.post('/register', validateRequest({ body: RegisterSchema }), asyncHandler(authController.register))

/**
 * @openapi
 * /v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
AuthRoute.post('/login', validateRequest({ body: LoginSchema }), asyncHandler(authController.login))

/**
 * @openapi
 * /v1/auth/verify-otp:
 *   post:
 *     summary: Verify account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: Successful verification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
AuthRoute.post(
  '/verify-otp',
  validateRequest({ body: VerifyAccountSchema }),
  asyncHandler(authController.verifyAccount)
)

/**
 * @openapi
 * /v1/auth/refresh-token:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Successful refresh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 */
AuthRoute.post(
  '/refresh-token',
  validateRequest({ body: RefreshTokenSchema }),
  asyncHandler(authController.refreshToken)
)

/**
 * @openapi
 * /v1/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Successful reset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
AuthRoute.post(
  '/reset-password',
  validateRequest({ body: ForgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
)

/**
 * @openapi
 * /v1/auth/forgot-password:
 *   post:
 *     summary: Send email forgot password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Successful send email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
AuthRoute.post(
  '/forgot-password',
  validateRequest({ body: EmailParamsSchema }),
  asyncHandler(authController.sendEmailForgotPassword)
)

/**
 * @openapi
 * /v1/auth/logout:
 *  post:
 *    summary: Logout user
 *    tags: [Auth]
 *    responses:
 *      200:
 *        description: Successful logout
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BaseResponse'
 */
AuthRoute.post('/logout', authMiddleware, asyncHandler(authController.logout))

/**
 * @openapi
 * /v1/auth/change-password:
 *  post:
 *    summary: Change password
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ChangePasswordRequest'
 *    responses:
 *      200:
 *        description: Successful change password
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BaseResponse'
 */
AuthRoute.post(
  '/change-password',
  authMiddleware,
  validateRequest({ body: ChangePasswordSchema }),
  asyncHandler(authController.changePassword)
)

// Admin routes

export default AuthRoute
