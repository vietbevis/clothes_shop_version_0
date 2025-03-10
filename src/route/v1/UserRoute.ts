import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { UserController } from '@/controller/UserController'
import { validateRequest } from '@/middleware/validateRequest'
import { UpdateProfileSchema } from '@/validation/CommonSchema'
import { resolveInstance } from '@/container'

const UserRoute = Router()

UserRoute.get('/me', authMiddleware, resolveInstance(UserController, 'getMe'))
UserRoute.get('/:username', resolveInstance(UserController, 'getUser'))
UserRoute.put(
  '/update-profile',
  validateRequest({ body: UpdateProfileSchema }),
  authMiddleware,
  resolveInstance(UserController, 'updateProfile')
)
export default UserRoute
