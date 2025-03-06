import { Request, Response } from 'express'
import { UserService } from '@/service/UserService'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { ChangeImageProfileParamsType, UsernameParamsType } from '@/validation/CommonSchema'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async getMe(req: Request, res: Response) {
    const result = await this.userService.getMe(req.user)
    new OkResponse('User data', omitFields(result, ['password', 'providerId', 'status', 'userId'])).send(res)
  }

  async getUser(req: Request<UsernameParamsType>, res: Response) {
    const result = await this.userService.getUserByUsername(req.params.username)
    new OkResponse('User data', omitFields(result, ['password', 'providerId', 'status', 'userId'])).send(res)
  }

  async changeImageProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const type = (req.query as ChangeImageProfileParamsType).type
    const filename = req.body.filename as string
    const result = await this.userService.changeImageProfile(req.user, filename, type)
    new OkResponse('Image profile changed', [result]).send(res)
  }

  async updateProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await this.userService.updateProfile(req.user, req.body)
    new OkResponse('Profile updated', result).send(res)
  }

  async hideProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    await this.userService.hideProfile(req.user)
    new OkResponse('Profile hidden').send(res)
  }
}
