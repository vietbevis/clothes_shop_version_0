import {
  ChangePasswordBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType
} from '@/validation/AuthSchema'
import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError, EntityError, UnauthorizedError, ValidationError } from '@/core/ErrorResponse'
import { generateOTP, generateUsername, hashPassword } from '@/utils/helper'
import { RoleBased, TokenType, UserStatus, VerificationCodeType } from '@/utils/enums'
import { User } from '@/model/User'
import { MESSAGES } from '@/utils/message'
import { logError } from '@/utils/log'
import { RoleRepository } from '@/repository/RoleRepository'
import { EmailService } from '@/service/EmailService'
import { DecodedJwtToken, JwtService } from '@/service/JwtService'
import { UserDeviceRepository } from '@/repository/UserDeviceRepository'
import { forgotPasswordKey, sessionKey, verificationKey } from '@/utils/keyRedis'
import envConfig from '@/config/envConfig'
import ms from 'ms'
import { Request } from 'express'
import { UAParser } from 'ua-parser-js'
import { ProfileRepository } from '@/repository/ProfileRepository'
import { Role } from '@/model/Role'
import { Injectable } from '@/decorators/inject'
import { RedisService } from './RedisService'
import { LoginDataRes, RefreshTokenDataRes } from '@/dtos/AuthDTO'
import { OAuth2Client } from 'google-auth-library'
import { v7 } from 'uuid'

@Injectable()
export class AuthService {
  private roleBased: Role | null = null
  private readonly client: OAuth2Client

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly userDeviceRepository: UserDeviceRepository,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService
  ) {
    this.client = new OAuth2Client(envConfig.GOOGLE_CLIENT_ID)
  }

  async getRoleBased(): Promise<Role> {
    if (this.roleBased) return this.roleBased

    const result = await this.roleRepository.findByName(RoleBased.ADMIN)
    if (!result) throw new BadRequestError(MESSAGES.ROLE_NOT_FOUND)
    this.roleBased = result
    return result
  }

  async sendOTP({ email, type }: SendOTPBodyType): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email)

    if (type === VerificationCodeType.REGISTER && user) throw new BadRequestError(MESSAGES.USER_ALREADY_EXISTS)
    if (type === VerificationCodeType.FORGOT_PASSWORD && !user)
      throw new ValidationError(MESSAGES.ACCOUNT_NOT_FOUND, new EntityError('email', MESSAGES.ACCOUNT_NOT_FOUND))

    const otpCode = generateOTP()
    const keyRedis =
      type === VerificationCodeType.REGISTER ? verificationKey(email, otpCode) : forgotPasswordKey(email, otpCode)
    const expiresInSeconds = ms(envConfig.VERIFICATION_TOKEN_EXPIRES_IN) / 1000

    await Promise.all([
      this.emailService.sendEmail({ email, verificationToken: otpCode }),
      this.redisService.setCacheItem(keyRedis, otpCode, expiresInSeconds)
    ])

    return true
  }

  async register(body: RegisterBodyType): Promise<boolean> {
    const otpInRedis = await this.redisService.getCacheItem(verificationKey(body.email, body.otp))
    if (!otpInRedis) throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN)

    try {
      const pwdHash = await hashPassword(body.password)
      const roles = await this.getRoleBased()

      const newUser = this.userRepository.create({
        email: body.email,
        password: pwdHash,
        status: UserStatus.VERIFIED,
        roles: [roles],
        username: generateUsername(body.email.split('@')[0]),
        fullName: body.fullName,
        profile: this.profileRepository.create()
      })

      await this.userRepository.save(newUser)
      await this.redisService.deleteCacheItem(verificationKey(body.email, body.otp))
      return true
    } catch (error: any) {
      logError(error)
      throw new BadRequestError(MESSAGES.USER_ALREADY_EXISTS)
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email, { roles: true })
    if (!user) throw new UnauthorizedError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    const isPasswordMatch = await user.comparePassword(password)
    if (!isPasswordMatch) throw new UnauthorizedError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    if (user.status === UserStatus.NOT_VERIFIED) throw new UnauthorizedError(MESSAGES.ACCOUNT_NOT_ACTIVE)
    if (user.status === UserStatus.BLOCKED) throw new UnauthorizedError(MESSAGES.ACCOUNT_BLOCKED)
    if (user.status === UserStatus.DELETED) throw new UnauthorizedError(MESSAGES.ACCOUNT_DELETED)

    return user
  }

  private getDeviceInfo(
    req: Request,
    deviceId: string = v7()
  ): {
    deviceId: string
    deviceName: string
    ipAddress: string
  } {
    const parser = new UAParser(req.headers['user-agent'])
    return {
      deviceId,
      deviceName: `${parser.getOS().name} ${parser.getOS().version} - ${parser.getBrowser().name}`,
      ipAddress: req.ip || ''
    }
  }

  private async generateTokens(
    user: User | DecodedJwtToken,
    deviceId: string
  ): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateToken(user, TokenType.ACCESS_TOKEN, deviceId),
      this.jwtService.generateToken(user, TokenType.REFRESH_TOKEN, deviceId)
    ])

    return { accessToken, refreshToken }
  }

  private async saveRefreshToken(email: string, deviceId: string, refreshToken: string): Promise<void> {
    const expiresInSeconds = ms(envConfig.REFRESH_TOKEN_EXPIRES_IN) / 1000
    await this.redisService.setCacheItem(
      sessionKey(email, deviceId, TokenType.REFRESH_TOKEN),
      refreshToken,
      expiresInSeconds
    )
  }

  async login(body: LoginBodyType, req: Request) {
    const { deviceId, email, password } = body
    const user = await this.validateUser(email, password)

    const { accessToken, refreshToken } = await this.generateTokens(user, deviceId)

    // Save or update device info
    let deviceInfo = await this.userDeviceRepository.findDeviceByUserIdAndDeviceId(user.id, deviceId)
    if (deviceInfo && deviceInfo.ipAddress !== req.ip) {
      deviceInfo.ipAddress = req.ip || ''
      deviceInfo.lastLoginAt = new Date()
    } else if (!deviceInfo) {
      const { deviceName, ipAddress } = this.getDeviceInfo(req, deviceId)
      deviceInfo = this.userDeviceRepository.create({
        deviceId,
        deviceName,
        ipAddress,
        lastLoginAt: new Date(),
        user
      })
    }

    await Promise.all([
      this.userDeviceRepository.save(deviceInfo),
      this.saveRefreshToken(email, deviceId, refreshToken)
    ])

    const result = {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: refreshToken
    }

    return LoginDataRes.parse(result)
  }

  async logout(user: DecodedJwtToken, req: Request): Promise<boolean> {
    await this.redisService.deleteCacheItem(sessionKey(user.sub, req.deviceId, TokenType.REFRESH_TOKEN))
    return true
  }

  async refreshToken(body: RefreshTokenBodyType) {
    const { refreshToken } = body

    const decoded = await JwtService.verifyToken(refreshToken, TokenType.REFRESH_TOKEN)
    const { deviceId } = decoded.payload

    const refreshTokenFromCached = await this.redisService.getCacheItem(
      sessionKey(decoded.sub, deviceId, TokenType.REFRESH_TOKEN)
    )

    if (!refreshTokenFromCached || refreshToken !== refreshTokenFromCached)
      throw new UnauthorizedError('Invalid refresh token')

    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(decoded, deviceId)
    await this.saveRefreshToken(decoded.sub, deviceId, newRefreshToken)

    const result = {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: newRefreshToken // Return the new refresh token
    }

    return RefreshTokenDataRes.parse(result)
  }

  async changePassword(userReq: DecodedJwtToken, body: ChangePasswordBodyType): Promise<boolean> {
    const { currentPassword, newPassword } = body

    const user = await this.userRepository.findByEmail(userReq.sub)
    if (!user) throw new UnauthorizedError()

    const isPasswordMatch = await user.comparePassword(currentPassword)
    if (!isPasswordMatch) throw new BadRequestError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    const pwdHash = await hashPassword(newPassword)
    await this.userRepository.changePassword(user.email, pwdHash)

    return true
  }

  async forgotPassword(body: ForgotPasswordBodyType): Promise<boolean> {
    const { email, otp, newPassword } = body

    const otpCached = await this.redisService.getCacheItem(forgotPasswordKey(email, otp))
    if (!otpCached) throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN)

    const pwdHash = await hashPassword(newPassword)
    await this.userRepository.changePassword(email, pwdHash)
    await this.redisService.deleteCacheItem(forgotPasswordKey(email, otp))

    return true
  }

  private async handleExistingGoogleUser(
    user: User,
    deviceInfo: { deviceId: string; deviceName: string; ipAddress: string },
    email: string,
    googleId: string
  ) {
    // Check device info
    let device = await this.userDeviceRepository.findDeviceByUserIdAndDeviceId(user.id, deviceInfo.deviceId)
    if (device) {
      device.ipAddress = deviceInfo.ipAddress
      device.deviceName = deviceInfo.deviceName
      device.lastLoginAt = new Date()
    } else {
      device = this.userDeviceRepository.create({
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        ipAddress: deviceInfo.ipAddress,
        lastLoginAt: new Date(),
        user
      })
    }

    // Update user
    user.googleId = googleId

    const [_, __, { accessToken, refreshToken }] = await Promise.all([
      await this.userDeviceRepository.save(device),
      await this.userRepository.save(user),
      await this.generateTokens(user, deviceInfo.deviceId)
    ])

    await this.saveRefreshToken(email, deviceInfo.deviceId, refreshToken)

    const result = {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: refreshToken
    }

    return LoginDataRes.parse(result)
  }

  async googleLogin(req: Request) {
    const { tokenId, deviceId } = req.body

    if (!tokenId) {
      throw new BadRequestError('Token ID is required')
    }

    // Xác thực token với Google sử dụng googleapis
    const ticket = await this.client.verifyIdToken({
      idToken: tokenId,
      audience: envConfig.GOOGLE_CLIENT_ID
    })

    // Lấy thông tin người dùng từ payload
    const payload = ticket.getPayload()

    if (!payload) {
      throw new BadRequestError('Invalid token')
    }

    const googleId = payload?.sub || ''
    const email = payload?.email || ''
    const fullName = payload?.name || ''
    const avatarUrl = payload?.picture || ''
    const deviceInfo = this.getDeviceInfo(req, deviceId)

    // Kiểm tra xem người dùng đã đăng nhập bằng Google trước đó chưa
    const user = await this.userRepository.findOne({ where: { email }, relations: { roles: true } })
    if (user) {
      if (user.googleId) {
        return this.handleExistingGoogleUser(user, deviceInfo, email, googleId)
      } else {
        throw new BadRequestError('Please login with email and password.')
      }
    } else {
      return this.createGoogleUser({ id: googleId, email, name: fullName, picture: avatarUrl }, deviceInfo)
    }
  }

  private async createGoogleUser(
    userData: { id: string; email: string; name: string; picture: string },
    deviceInfo: { deviceId: string; deviceName: string; ipAddress: string }
  ) {
    // Get role
    const roles = await this.getRoleBased()

    // Create new user
    const newUser = this.userRepository.create({
      email: userData.email,
      status: UserStatus.VERIFIED,
      password: await hashPassword(v7()),
      googleId: userData.id,
      roles: [roles],
      fullName: userData.name,
      username: generateUsername(userData.email.split('@')[0]),
      avatarUrl: userData.picture || '',
      profile: this.profileRepository.create(),
      devices: [
        this.userDeviceRepository.create({
          deviceId: deviceInfo.deviceId,
          deviceName: deviceInfo.deviceName,
          ipAddress: deviceInfo.ipAddress,
          lastLoginAt: new Date()
        })
      ]
    })

    // Save user
    await this.userRepository.save(newUser)

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(newUser, deviceInfo.deviceId)
    await this.saveRefreshToken(userData.email, deviceInfo.deviceId, refreshToken)

    const result = {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: refreshToken
    }

    return LoginDataRes.parse(result)
  }
}
