import { Request, Response } from 'express'
import userService from '@/service/UserService'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { ChangeImageProfileParamsType, UsernameParamsType } from '@/validation/CommonSchema'
import { OkResponse } from '@/core/SuccessResponse'

class UserController {
  async getMe(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await userService.getMe(req.user)
    new OkResponse('User data', result).send(res)
  }

  async getUser(req: Request<UsernameParamsType>, res: Response) {
    const result = await userService.getUserByUsername(req.params.username)
    new OkResponse('User data', result).send(res)
  }

  async changeImageProfile(req: Request<ChangeImageProfileParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()

    const type = req.params.type
    const result = await userService.changeImageProfile(req.user, req.filesUploaded, type)
    new OkResponse('Image profile changed', result).send(res)
  }

  async changeImageProfileLink(req: Request<ChangeImageProfileParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()

    const type = req.params.type
    const filename = req.query.filename as string
    const result = await userService.changeImageProfileLink(req.user, filename, type)
    new OkResponse('Image profile changed', result).send(res)
  }
}

const userController = new UserController()
export default userController
