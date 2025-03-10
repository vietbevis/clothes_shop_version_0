import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { UserController } from '@/controller/UserController'
import { validateRequest } from '@/middleware/validateRequest'
import { resolveInstance } from '@/container'
import { UpdateProfileSchema } from '@/validation/UserSchema'

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
