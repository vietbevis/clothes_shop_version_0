import { User } from '@/model/User'
import { hashPassword, omitFields } from '@/utils/helper'
import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import { ImageType } from '@/utils/enums'
import { UpdateProfileType } from '@/validation/CommonSchema'
import { ProfileRepository } from '@/repository/ProfileRepository'
import { MESSAGES } from '@/utils/message'
import { ImageRepository } from '@/repository/ImageRepository'
import { DecodedJwtToken } from './JwtService'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly imageRepository: ImageRepository,
    private readonly profileRepository: ProfileRepository
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const { username, email, password, fullName } = userData

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: [{ username }, { email }] })
    if (existingUser) {
      throw new Error('User with this username or email already exists')
    }

    // Hash the password
    const hashedPassword = await hashPassword(password!)

    // Create new user
    const user = this.userRepository.create({
      username,
      email,
      fullName,
      password: hashedPassword
    })

    return this.userRepository.save(user)
  }

  async loadUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.loadUserByEmail(email, { roles: true })
  }

  async getMe(user: DecodedJwtToken) {
    const result = await this.userRepository.findById(user.payload.id, { profile: true })
    if (!result) throw new BadRequestError()
    return omitFields(result, [])
  }

  async getUserByUsername(username: string) {
    const result = await this.userRepository.findByUsernameAndActiveProfile(username)
    if (!result) throw new BadRequestError('User not found')
    return omitFields(result, [])
  }

  async changeImageProfile(userReq: DecodedJwtToken, filename: string, type: ImageType) {
    const targetImage = await this.imageRepository.findByFileName(filename)

    if (!targetImage) throw new BadRequestError('Image not found')
    const user = await this.userRepository.findByEmail(userReq.sub)
    if (!user) throw new UnauthorizedError()

    if (type === ImageType.AVATAR) {
      user.avatar = targetImage
    } else if (type === ImageType.COVER) {
      user.coverPhoto = targetImage
    }

    const result = await this.userRepository.save(user)

    const res = type === ImageType.AVATAR ? result.avatar : result.coverPhoto
    return omitFields(res, ['userId', 'user'])
  }

  async updateProfile(user: DecodedJwtToken, data: UpdateProfileType) {
    const profile = await this.profileRepository.findByUserId(user.payload.id)
    if (!profile) throw new BadRequestError(MESSAGES.ACCOUNT_NOT_FOUND)
    const updatedUser = this.profileRepository.merge(profile, data)
    const result = await this.profileRepository.save(updatedUser)
    return omitFields(result, [])
  }

  async hideProfile(user: DecodedJwtToken) {
    const profile = await this.profileRepository.findByUserId(user.payload.id)
    if (!profile) throw new BadRequestError(MESSAGES.ACCOUNT_NOT_FOUND)
    profile.isPublic = !profile.isPublic
    const result = await this.profileRepository.save(profile)
    omitFields(result, [])
  }
}
