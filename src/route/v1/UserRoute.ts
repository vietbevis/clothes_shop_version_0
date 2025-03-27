import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { UserController } from '@/controller/UserController'
import { validateRequest } from '@/middleware/validateRequest'
import { resolveController } from '@/container'
import { GetUsersSchema, UpdateProfileSchema } from '@/validation/UserSchema'

const UserRoute = Router()

UserRoute.get('/', validateRequest({ query: GetUsersSchema }), resolveController(UserController, 'getUsers'))
UserRoute.get('/me', authMiddleware, resolveController(UserController, 'getMe'))
UserRoute.get('/:username', resolveController(UserController, 'getUser'))
UserRoute.put(
  '/update-profile',
  validateRequest({ body: UpdateProfileSchema }),
  authMiddleware,
  resolveController(UserController, 'updateProfile')
)
export default UserRoute
