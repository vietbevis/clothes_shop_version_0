import { OkResponse } from '@/core/SuccessResponse'
import { Request, Response } from 'express'
import authService from '@/service/AuthService'

class AuthController {
  async register(req: Request, res: Response) {
    await authService.register(req.body)
    new OkResponse('Registered successfully').send(res)
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body, req)
    new OkResponse('Login successfully', result).send(res)
  }

  async forgotPassword(req: Request, res: Response) {
    await authService.forgotPassword(req.body)
    new OkResponse('Forgot password successfully').send(res)
  }

  async logout(req: Request, res: Response) {
    await authService.logout(req.user, req)
    new OkResponse('Logout successfully').send(res)
  }

  async refreshToken(req: Request, res: Response) {
    const result = await authService.refreshToken(req.body)
    new OkResponse('Refresh token successfully', result).send(res)
  }

  async changePassword(req: Request, res: Response) {
    await authService.changePassword(req.user, req.body)
    new OkResponse('Change password successfully').send(res)
  }

  async sendOTP(req: Request, res: Response) {
    await authService.sendOTP(req.body)
    new OkResponse('OTP sent successfully').send(res)
  }
}

const authController = new AuthController()
export default authController
