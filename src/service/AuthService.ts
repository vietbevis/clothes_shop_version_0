import {
  ChangePasswordBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType
} from '@/validation/AuthSchema'
import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import { generateOTP, generateUsername, hashPassword } from '@/utils/helper'
import { LoginResponseType, RoleBased, TokenType, UserStatus, VerificationCodeType } from '@/utils/enums'
import { User } from '@/model/User'
import { MESSAGES } from '@/utils/message'
import { logError } from '@/utils/log'
import { RoleRepository } from '@/repository/RoleRepository'
import EmailService from '@/service/EmailService'
import jwtService, { DecodedJwtToken } from '@/service/JwtService'
import { UserDeviceRepository } from '@/repository/UserDeviceRepository'
import redisService from '@/service/RedisService'
import { forgotPasswordKey, sessionKey, verificationKey } from '@/utils/keyRedis'
import envConfig from '@/config/envConfig'
import ms from 'ms'
import { Request } from 'express'
import { UAParser } from 'ua-parser-js'
import { ProfileRepository } from '@/repository/ProfileRepository'
import { Role } from '@/model/Role'

class AuthService {
  private roleBased: Role | null = null

  async getRoleBased(): Promise<Role> {
    if (this.roleBased) return this.roleBased

    const result = await RoleRepository.findByName(RoleBased.ADMIN)
    if (!result) throw new BadRequestError(MESSAGES.ROLE_NOT_FOUND)
    this.roleBased = result
    return result
  }

  async sendOTP({ email, type }: SendOTPBodyType): Promise<boolean> {
    if (type === VerificationCodeType.REGISTER) {
      const user = await UserRepository.findByEmail(email)
      if (user) throw new BadRequestError(MESSAGES.USER_ALREADY_EXISTS)
    }

    const otpCode = generateOTP()

    const keyRedis =
      type === VerificationCodeType.REGISTER ? verificationKey(email, otpCode) : forgotPasswordKey(email, otpCode)

    await Promise.all([
      EmailService.sendEmail({ email, verificationToken: otpCode }),
      redisService.setCacheItem(keyRedis, otpCode, ms(envConfig.VERIFICATION_TOKEN_EXPIRES_IN) / 1000)
    ])

    return true
  }

  async register(body: RegisterBodyType): Promise<boolean> {
    const otpInRedis = await redisService.getCacheItem(verificationKey(body.email, body.otp))
    if (!otpInRedis) throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN)

    try {
      // Generate a unique username
      const username = generateUsername(body.email.split('@')[0])

      // Hash the password
      const pwdHash = await hashPassword(body.password)

      // Get role default is ROLE_USER
      const roles = await this.getRoleBased()

      // Create a new user
      const newUser = UserRepository.create({
        fullName: body.fullName,
        email: body.email,
        password: pwdHash,
        username,
        status: UserStatus.VERIFIED,
        roles: [roles],
        profile: ProfileRepository.create()
      })

      // Save the user
      await UserRepository.save(newUser)
      return true
    } catch (error: any) {
      logError(error)
      throw new BadRequestError(MESSAGES.USER_ALREADY_EXISTS)
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    // Find the user by email
    const user = await UserRepository.findByEmail(email, { roles: true })
    if (!user) throw new UnauthorizedError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    // Compare the password
    const isPasswordMatch = await user.comparePassword(password)
    if (!isPasswordMatch) throw new UnauthorizedError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    // Check the user status
    if (user.status === UserStatus.NOT_VERIFIED) throw new UnauthorizedError(MESSAGES.ACCOUNT_NOT_ACTIVE)
    if (user.status === UserStatus.BLOCKED) throw new UnauthorizedError(MESSAGES.ACCOUNT_BLOCKED)
    if (user.status === UserStatus.DELETED) throw new UnauthorizedError(MESSAGES.ACCOUNT_DELETED)

    return user
  }

  getDeviceName(req: Request) {
    const parser = new UAParser(req.headers['user-agent'])
    return `${parser.getOS().name} ${parser.getOS().version} - ${parser.getBrowser().name}`
  }

  async login(body: LoginBodyType, req: Request): Promise<LoginResponseType> {
    const { deviceId, email, password } = body

    // Check logged in device
    const isLogged = await redisService.getCacheItem(sessionKey(email, deviceId, TokenType.REFRESH_TOKEN))
    if (isLogged) throw new BadRequestError(MESSAGES.DEVICE_ALREADY_LOGGED_IN)

    // Validate the user
    const user = await this.validateUser(email, password)

    // Generate the token
    const [accessToken, refreshToken] = await Promise.all([
      jwtService.generateToken(user, TokenType.ACCESS_TOKEN, deviceId),
      jwtService.generateToken(user, TokenType.REFRESH_TOKEN, deviceId)
    ])

    // Save device info
    let deviceInfo = await UserDeviceRepository.findDeviceByUserIdAndDeviceId(user.id, deviceId)
    if (deviceInfo && deviceInfo.ipAddress !== req.ip) {
      deviceInfo.ipAddress = req.ip || ''
    } else if (!deviceInfo) {
      deviceInfo = UserDeviceRepository.create({
        deviceId,
        deviceName: this.getDeviceName(req),
        ipAddress: req.ip || '',
        lastLoginAt: new Date(),
        user
      })
    }

    await Promise.all([
      UserDeviceRepository.save(deviceInfo),
      redisService.setCacheItem(
        sessionKey(email, deviceId, TokenType.REFRESH_TOKEN),
        refreshToken,
        ms(envConfig.REFRESH_TOKEN_EXPIRES_IN) / 1000
      )
    ])

    return {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: refreshToken
    }
  }

  async logout(user: DecodedJwtToken, req: Request): Promise<boolean> {
    await redisService.deleteCacheItem(sessionKey(user.sub, req.deviceId, TokenType.REFRESH_TOKEN))
    return true
  }

  async refreshToken(body: RefreshTokenBodyType): Promise<LoginResponseType> {
    const { refreshToken } = body

    const decoded = await jwtService.verifyToken(refreshToken, TokenType.REFRESH_TOKEN)
    const { deviceId } = decoded.payload

    // Get token from redis
    const refreshTokenFromCached = await redisService.getCacheItem(
      sessionKey(decoded.sub, deviceId, TokenType.REFRESH_TOKEN)
    )

    // Check token is valid
    if (!refreshTokenFromCached || refreshToken !== refreshTokenFromCached) throw new UnauthorizedError()

    // Generate the token
    const [accessToken, newRefreshToken] = await Promise.all([
      jwtService.generateToken(decoded, TokenType.ACCESS_TOKEN, deviceId),
      jwtService.generateToken(decoded, TokenType.REFRESH_TOKEN, deviceId)
    ])

    // Save token to redis
    await redisService.setCacheItem(
      sessionKey(decoded.sub, deviceId, TokenType.REFRESH_TOKEN),
      newRefreshToken,
      ms(envConfig.REFRESH_TOKEN_EXPIRES_IN) / 1000
    )
    return {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: newRefreshToken
    }
  }

  async changePassword(userReq: DecodedJwtToken, body: ChangePasswordBodyType): Promise<boolean> {
    const { currentPassword, newPassword } = body

    const user = await UserRepository.findByEmail(userReq.sub)

    if (!user) throw new UnauthorizedError()

    // Check the current password match
    const isPasswordMatch = await user.comparePassword(currentPassword)
    if (!isPasswordMatch) throw new BadRequestError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    // Hash the new password
    const pwdHash = await hashPassword(newPassword)

    // Update the password
    await UserRepository.changePassword(user.email, pwdHash)

    return true
  }

  async forgotPassword(body: ForgotPasswordBodyType): Promise<boolean> {
    const { email, otp, newPassword } = body

    // Get otp from redis
    const otpCached = await redisService.getCacheItem(forgotPasswordKey(email, otp))
    if (!otpCached) throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN)

    // Hash the new password
    const pwdHash = await hashPassword(newPassword)

    // Update the password
    await UserRepository.changePassword(email, pwdHash)

    // Delete otp from redis
    await redisService.deleteCacheItem(forgotPasswordKey(email, otp))

    return true
  }
}

const authService = new AuthService()
export default authService
