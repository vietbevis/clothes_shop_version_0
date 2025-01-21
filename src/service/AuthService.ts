import {
  ChangePasswordBodyType,
  EmailParamsType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  VerifyAccountBodyType
} from '@/validation/AuthSchema'
import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import { getUsername, hashPassword } from '@/utils/helper'
import { LoginResponseType, TokenType, UserStatus } from '@/utils/enums'
import { User } from '@/model/User'
import { MESSAGES } from '@/utils/message'
import { logInfo } from '@/utils/log'
import { RoleRepository } from '@/repository/RoleRepository'
import EmailService from '@/service/EmailService'
import jwtService from '@/service/JwtService'
import { UserDeviceRepository } from '@/repository/UserDeviceRepository'
import redisService from '@/service/RedisService'
import { forgotPasswordKey, sessionKey, verificationKey } from '@/utils/keyRedis'
import envConfig from '@/config/envConfig'
import ms from 'ms'
import { Request } from 'express'
import { Profile } from '@/model/Profile'

class AuthService {
  async register(body: RegisterBodyType): Promise<boolean> {
    logInfo('Registering a new user')
    // Check if the email is already registered
    const userExisting = await UserRepository.findByEmail(body.email)
    if (userExisting) throw new BadRequestError(MESSAGES.USER_ALREADY_EXISTS)

    // Generate a unique username
    const username = getUsername(body.fullName)

    // Hash the password
    const pwdHash = await hashPassword(body.password)

    // Get role default is ROLE_USER
    const roles = await RoleRepository.findByName('customer')
    if (!roles) throw new BadRequestError(MESSAGES.ROLE_NOT_FOUND)

    // Create a new user
    const newUser = UserRepository.create({
      fullName: body.fullName,
      email: body.email,
      password: pwdHash,
      username,
      status: UserStatus.NOT_VERIFIED,
      roles: [roles],
      profile: new Profile()
    })

    // Save the user
    await UserRepository.save(newUser)

    // Create a verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()

    await Promise.all([
      // Send the verification email
      EmailService.sendEmail({ email: newUser.email, verificationToken }),

      // Save token verification to redis
      redisService.setCacheItem(
        verificationKey(newUser.email),
        verificationToken,
        ms(envConfig.VERIFICATION_TOKEN_EXPIRES_IN) / 1000
      )
    ])

    logInfo('Send verification email to: [' + newUser.email + '] with token: [' + verificationToken + '] successfully')
    logInfo('User created successfully: ' + newUser.email)
    return true
  }

  async validateUser(email: string, password: string): Promise<User> {
    logInfo('Validating the user')
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

    logInfo('User validated successfully: ' + email)
    return user
  }

  async login(body: LoginBodyType, req: Request): Promise<LoginResponseType> {
    const { deviceName, deviceType, email, password } = body

    // Check logged in device
    const isLogged = await redisService.getCacheItem(sessionKey(email, deviceName, deviceType, TokenType.REFRESH_TOKEN))
    if (isLogged) throw new BadRequestError(MESSAGES.DEVICE_ALREADY_LOGGED_IN)

    // Validate the user
    const user = await this.validateUser(email, password)

    // Generate the token
    const [accessToken, refreshToken] = await Promise.all([
      jwtService.generateToken(user, TokenType.ACCESS_TOKEN, deviceName, deviceType),
      jwtService.generateToken(user, TokenType.REFRESH_TOKEN, deviceName, deviceType)
    ])

    // Save device info
    let deviceInfo = await UserDeviceRepository.findActiveDeviceByUserEmailAndDeviceInfo(email, deviceName, deviceType)
    if (deviceInfo && deviceInfo.ipAddress !== req.ip) {
      deviceInfo.ipAddress = req.ip || ''
      await UserDeviceRepository.save(deviceInfo)
    } else if (!deviceInfo) {
      deviceInfo = UserDeviceRepository.create({
        deviceName,
        deviceType,
        ipAddress: req.ip || '',
        lastLoginAt: new Date(),
        user
      })
      await UserDeviceRepository.save(deviceInfo)
    }

    // Save token to redis
    await Promise.all([
      redisService.setCacheItem(
        sessionKey(email, deviceName, deviceType, TokenType.ACCESS_TOKEN),
        accessToken,
        ms(envConfig.ACCESS_TOKEN_EXPIRES_IN) / 1000
      ),
      redisService.setCacheItem(
        sessionKey(email, deviceName, deviceType, TokenType.REFRESH_TOKEN),
        refreshToken,
        ms(envConfig.REFRESH_TOKEN_EXPIRES_IN) / 1000
      )
    ])

    logInfo('User logged in successfully: ' + user.email)

    return {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: refreshToken
    }
  }

  async verifyAccount(body: VerifyAccountBodyType): Promise<boolean> {
    const { email, token } = body

    // Get token from redis
    const tokenCached = await redisService.getCacheItem(verificationKey(email))

    // Check token is valid
    if (tokenCached !== token) throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN)

    // Change user status to VERIFIED
    await UserRepository.changeStatus(email, UserStatus.VERIFIED)

    // Delete token from redis
    await redisService.deleteCacheItem(verificationKey(email))

    logInfo('User account verified successfully: ' + email)
    return true
  }

  async logout(user: User | null, req: Request): Promise<boolean> {
    const { deviceName, deviceType } = req

    if (!user) {
      throw new UnauthorizedError()
    }

    // Delete token from redis
    await Promise.all([
      redisService.deleteCacheItem(sessionKey(user.email, deviceName, deviceType, TokenType.ACCESS_TOKEN)),
      redisService.deleteCacheItem(sessionKey(user.email, deviceName, deviceType, TokenType.REFRESH_TOKEN))
    ])

    logInfo('User logged out successfully: ' + user.email)
    return true
  }

  async refreshToken(body: RefreshTokenBodyType): Promise<LoginResponseType> {
    const { refreshToken } = body

    const decoded = await jwtService.verifyToken(refreshToken, TokenType.REFRESH_TOKEN)
    const { deviceName, deviceType } = decoded.payload

    // Get token from redis
    const refreshTokenFromCached = await redisService.getCacheItem(
      sessionKey(decoded.sub, deviceName, deviceType, TokenType.REFRESH_TOKEN)
    )

    // Check token is valid
    if (!refreshTokenFromCached || refreshToken !== refreshTokenFromCached) throw new UnauthorizedError()

    // Generate the token
    const [accessToken, newRefreshToken] = await Promise.all([
      jwtService.generateToken(decoded, TokenType.ACCESS_TOKEN, deviceName, deviceType),
      jwtService.generateToken(decoded, TokenType.REFRESH_TOKEN, deviceName, deviceType)
    ])

    // Save token to redis
    await Promise.all([
      redisService.setCacheItem(
        sessionKey(decoded.sub, deviceName, deviceType, TokenType.ACCESS_TOKEN),
        accessToken,
        ms(envConfig.ACCESS_TOKEN_EXPIRES_IN) / 1000
      ),
      redisService.setCacheItem(
        sessionKey(decoded.sub, deviceName, deviceType, TokenType.REFRESH_TOKEN),
        newRefreshToken,
        ms(envConfig.REFRESH_TOKEN_EXPIRES_IN) / 1000
      )
    ])

    logInfo('User refreshed token successfully: ' + decoded.sub)
    return {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: newRefreshToken
    }
  }

  async sendTokenForgotPassword(body: EmailParamsType): Promise<boolean> {
    const { email } = body

    const user = await UserRepository.findByEmail(email)
    if (!user || user.status !== UserStatus.VERIFIED) {
      return false
    }

    // Create a verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()

    await Promise.all([
      // Send the verification email
      EmailService.sendEmail({ email: user.email, verificationToken }),

      // Save token verification to redis
      redisService.setCacheItem(
        forgotPasswordKey(user.email),
        verificationToken,
        ms(envConfig.VERIFICATION_TOKEN_EXPIRES_IN) / 1000
      )
    ])

    return true
  }

  async changePassword(userReq: User | null, body: ChangePasswordBodyType): Promise<boolean> {
    const { currentPassword, newPassword } = body

    if (!userReq) throw new UnauthorizedError()

    // Check the current password match
    const isPasswordMatch = await userReq.comparePassword(currentPassword)
    if (!isPasswordMatch) throw new BadRequestError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    // Hash the new password
    const pwdHash = await hashPassword(newPassword)

    // Update the password
    await UserRepository.changePassword(userReq.email, pwdHash)

    logInfo('User changed password successfully: ' + userReq.email)
    return true
  }

  async forgotPassword(body: ForgotPasswordBodyType): Promise<boolean> {
    const { email, token, newPassword } = body

    // Get token from redis
    const tokenCached = await redisService.getCacheItem(forgotPasswordKey(email))
    if (!tokenCached) throw new UnauthorizedError()

    // Check token is valid
    if (tokenCached !== token) throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN)

    // Hash the new password
    const pwdHash = await hashPassword(newPassword)

    // Update the password
    await UserRepository.changePassword(email, pwdHash)

    // Delete token from redis
    await redisService.deleteCacheItem(forgotPasswordKey(email))

    logInfo('User forgot password successfully: ' + email)
    return true
  }
}

const authService = new AuthService()
export default authService
