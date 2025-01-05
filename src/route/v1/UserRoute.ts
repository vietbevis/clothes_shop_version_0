import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import userController from '@/controller/UserController'
import asyncHandler from '@/middleware/asyncHandler'
import { uploadFileHandler } from '@/middleware/uploadFileHandler'
import multerFileMiddleware from '@/middleware/multerFileMiddleware'
import { validateRequest } from '@/middleware/validateRequest'
import { ChangeImageProfileParamsSchema, FilenameQuerySchema } from '@/validation/CommonSchema'

const UserRoute = Router()

UserRoute.get('/me', authMiddleware, asyncHandler(userController.getMe))
UserRoute.get('/:username', asyncHandler(userController.getUser))
UserRoute.put(
  '/image-profile/:type',
  validateRequest({ params: ChangeImageProfileParamsSchema }),
  authMiddleware,
  asyncHandler(multerFileMiddleware.array('files', 1)),
  asyncHandler(uploadFileHandler),
  asyncHandler(userController.changeImageProfile)
)
UserRoute.put(
  '/image-profile/:type/link',
  validateRequest({ params: ChangeImageProfileParamsSchema, query: FilenameQuerySchema }),
  authMiddleware,
  asyncHandler(userController.changeImageProfileLink)
)
export default UserRoute
