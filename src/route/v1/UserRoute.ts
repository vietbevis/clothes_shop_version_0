import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import userController from '@/controller/UserController'
import asyncHandler from '@/middleware/asyncHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { ChangeImageProfileParamsSchema, FilenameBodySchema, UpdateProfileSchema } from '@/validation/CommonSchema'

const UserRoute = Router()

UserRoute.get('/me', authMiddleware, asyncHandler(userController.getMe))
UserRoute.get('/:username', asyncHandler(userController.getUser))
UserRoute.put(
  '/update-profile',
  validateRequest({ body: UpdateProfileSchema }),
  authMiddleware,
  asyncHandler(userController.updateProfile)
)
UserRoute.post('/hide-profile', authMiddleware, asyncHandler(userController.hideProfile))
UserRoute.post(
  '/image-profile',
  validateRequest({ query: ChangeImageProfileParamsSchema, body: FilenameBodySchema }),
  authMiddleware,
  asyncHandler(userController.changeImageProfile)
)
export default UserRoute
