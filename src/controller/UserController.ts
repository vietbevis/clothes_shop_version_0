import { Request, Response } from 'express'
import userService from '@/service/UserService'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { ChangeImageProfileParamsType, UsernameParamsType } from '@/validation/CommonSchema'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'

class UserController {
  async getMe(req: Request, res: Response) {
    const result = await userService.getMe(req.user)
    new OkResponse('User data', omitFields(result, ['password', 'providerId', 'status', 'userId'])).send(res)
  }

  async getUser(req: Request<UsernameParamsType>, res: Response) {
    const result = await userService.getUserByUsername(req.params.username)
    new OkResponse('User data', omitFields(result, ['password', 'providerId', 'status', 'userId'])).send(res)
  }

  async changeImageProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const type = (req.query as ChangeImageProfileParamsType).type
    const filename = req.body.filename as string
    const result = await userService.changeImageProfile(req.user, filename, type)
    new OkResponse('Image profile changed', [result]).send(res)
  }

  async updateProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await userService.updateProfile(req.user, req.body)
    new OkResponse('Profile updated', result).send(res)
  }

  async hideProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    await userService.hideProfile(req.user)
    new OkResponse('Profile hidden').send(res)
  }
}

const userController = new UserController()
export default userController
