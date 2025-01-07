import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import userController from '@/controller/UserController'
import asyncHandler from '@/middleware/asyncHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { ChangeImageProfileParamsSchema, FilenameBodySchema, UpdateProfileSchema } from '@/validation/CommonSchema'

const UserRoute = Router()

UserRoute.get('/me', authMiddleware, asyncHandler(userController.getMe))
UserRoute.get('/:username', asyncHandler(userController.getUser))

/**
 * @openapi
 * /v1/users/update-profile:
 *   put:
 *     summary: Update profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileSchema'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
UserRoute.put(
  '/update-profile',
  validateRequest({ body: UpdateProfileSchema }),
  authMiddleware,
  asyncHandler(userController.updateProfile)
)

/**
 * @openapi
 * /v1/users/hide-profile:
 *   post:
 *     summary: Hide profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile hidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
UserRoute.post('/hide-profile', authMiddleware, asyncHandler(userController.hideProfile))

/**
 * @openapi
 * /v1/users/image-profile:
 *   post:
 *     summary: Change image profile by link
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [AVATAR, COVER]
 *           example: AVATAR
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                filename:
 *                  type: string
 *                  example: image.jpg
 *     responses:
 *       200:
 *         description: Successful change
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 */
UserRoute.post(
  '/image-profile',
  validateRequest({ query: ChangeImageProfileParamsSchema, body: FilenameBodySchema }),
  authMiddleware,
  asyncHandler(userController.changeImageProfile)
)
export default UserRoute
