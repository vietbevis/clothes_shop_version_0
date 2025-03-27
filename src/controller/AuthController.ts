import { OkResponse } from '@/core/SuccessResponse'
import { Request, Response } from 'express'
import { Injectable } from '@/decorators/inject'
import { AuthService } from '@/service/AuthService'
import { BadRequestError } from '@/core/ErrorResponse'

@Injectable()
export class AuthController {
  constructor(private authService: AuthService) {}

  async checkAuth(req: Request, res: Response) {
    new OkResponse('Authenticated').send(res)
  }

  async register(req: Request, res: Response) {
    await this.authService.register(req.body)
    new OkResponse('Registered successfully').send(res)
  }

  async login(req: Request, res: Response) {
    const result = await this.authService.login(req.body, req)
    new OkResponse('Login successfully', result).send(res)
  }

  async googleLogin(req: Request, res: Response) {
    const result = await this.authService.googleLogin(req)
    new OkResponse('Login successfully', result).send(res)
  }

  async forgotPassword(req: Request, res: Response) {
    await this.authService.forgotPassword(req.body)
    new OkResponse('Forgot password successfully').send(res)
  }

  async logout(req: Request, res: Response) {
    await this.authService.logout(req.user, req)
    new OkResponse('Logout successfully').send(res)
  }

  async refreshToken(req: Request, res: Response) {
    const result = await this.authService.refreshToken(req.body)
    new OkResponse('Refresh token successfully', result).send(res)
  }

  async changePassword(req: Request, res: Response) {
    await this.authService.changePassword(req.user, req.body)
    new OkResponse('Change password successfully').send(res)
  }

  async sendOTP(req: Request, res: Response) {
    await this.authService.sendOTP(req.body)
    new OkResponse('OTP sent successfully').send(res)
  }
}
