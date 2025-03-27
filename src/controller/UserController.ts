import { Request, Response } from 'express'
import { UserService } from '@/service/UserService'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { UsernameParamsType } from '@/validation/CommonSchema'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUsers(req: Request, res: Response) {
    const result = await this.userService.getUsers(req.query.search as string, req)
    new OkResponse('Users data', result).send(res)
  }

  async getMe(req: Request, res: Response) {
    const result = await this.userService.getMe(req.user)
    new OkResponse('User data', result).send(res)
  }

  async getUser(req: Request<UsernameParamsType>, res: Response) {
    const result = await this.userService.getUserByUsername(req.params.username)
    new OkResponse('User data', result).send(res)
  }

  async updateProfile(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await this.userService.updateProfile(req.user, req.body)
    new OkResponse('Profile updated', result).send(res)
  }
}
