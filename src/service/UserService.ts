import { User } from '@/model/User'
import { hashPassword, omitFields } from '@/utils/helper'
import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import { ImageType } from '@/utils/enums'
import { UpdateProfileType } from '@/validation/CommonSchema'
import { ProfileRepository } from '@/repository/ProfileRepository'
import { MESSAGES } from '@/utils/message'
import ImageRepository from '@/repository/ImageRepository'
import { DecodedJwtToken } from './JwtService'

class UserService {
  async createUser(userData: Partial<User>): Promise<User> {
    const { username, email, password, fullName } = userData

    // Check if user already exists
    const existingUser = await UserRepository.findOne({ where: [{ username }, { email }] })
    if (existingUser) {
      throw new Error('User with this username or email already exists')
    }

    // Hash the password
    const hashedPassword = await hashPassword(password!)

    // Create new user
    const user = UserRepository.create({
      username,
      email,
      fullName,
      password: hashedPassword
    })

    return UserRepository.save(user)
  }

  async loadUserByEmail(email: string): Promise<User | null> {
    return UserRepository.loadUserByEmail(email, { roles: true })
  }

  async getMe(user: DecodedJwtToken) {
    const result = await UserRepository.findById(user.payload.id, { profile: true })
    if (!result) throw new BadRequestError()
    return omitFields(result, [])
  }

  async getUserByUsername(username: string) {
    const result = await UserRepository.findByUsernameAndActiveProfile(username)
    if (!result) throw new BadRequestError('User not found')
    return omitFields(result, [])
  }

  async changeImageProfile(userReq: DecodedJwtToken, filename: string, type: ImageType) {
    const targetImage = await ImageRepository.findByFileName(filename)

    if (!targetImage) throw new BadRequestError('Image not found')
    const user = await UserRepository.findByEmail(userReq.sub)
    if (!user) throw new UnauthorizedError()

    if (type === ImageType.AVATAR) {
      user.avatar = targetImage
    } else if (type === ImageType.COVER) {
      user.coverPhoto = targetImage
    }

    const result = await UserRepository.save(user)

    const res = type === ImageType.AVATAR ? result.avatar : result.coverPhoto
    return omitFields(res, ['userId', 'user'])
  }

  async updateProfile(user: DecodedJwtToken, data: UpdateProfileType) {
    const profile = await ProfileRepository.findByUserId(user.payload.id)
    if (!profile) throw new BadRequestError(MESSAGES.ACCOUNT_NOT_FOUND)
    const updatedUser = ProfileRepository.merge(profile, data)
    const result = await ProfileRepository.save(updatedUser)
    return omitFields(result, [])
  }

  async hideProfile(user: DecodedJwtToken) {
    const profile = await ProfileRepository.findByUserId(user.payload.id)
    if (!profile) throw new BadRequestError(MESSAGES.ACCOUNT_NOT_FOUND)
    profile.isPublic = !profile.isPublic
    const result = await ProfileRepository.save(profile)
    omitFields(result, [])
  }
}

const userService = new UserService()
export default userService
