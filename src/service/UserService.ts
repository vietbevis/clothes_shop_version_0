import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError } from '@/core/ErrorResponse'
import { ProfileRepository } from '@/repository/ProfileRepository'
import { MESSAGES } from '@/utils/message'
import { DecodedJwtToken } from './JwtService'
import { Injectable } from '@/decorators/inject'
import { ProfileDTO, UserDTO, UsersDataRes } from '@/dtos/UserDTO'
import { UpdateProfileType } from '@/validation/UserSchema'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { Request } from 'express'
import { Like } from 'typeorm'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository
  ) {}

  async getUsers(search: string, req: Request) {
    const options = PaginationUtils.extractPaginationOptions(req, 'createdAt', 'DESC')
    const users = await PaginationUtils.paginate(this.userRepository, options, {
      fullName: search ? Like(`%${search}%`) : undefined
    })
    return UsersDataRes.parse(users)
  }

  async getMe(user: DecodedJwtToken) {
    const result = await this.userRepository.findById(user.payload.id, { profile: true })
    if (!result) throw new BadRequestError()
    return UserDTO.parse(result)
  }

  async getUserByUsername(username: string) {
    const result = await this.userRepository.findByUsernameAndActiveProfile(username)
    if (!result) throw new BadRequestError('User not found')
    return UserDTO.parse(result)
  }

  async updateProfile(user: DecodedJwtToken, data: UpdateProfileType) {
    const profile = await this.profileRepository.findByUserId(user.payload.id)
    if (!profile) throw new BadRequestError(MESSAGES.ACCOUNT_NOT_FOUND)
    const { fullName, avatarUrl, coverPhotoUrl, ...rest } = data
    const updatedUser = this.profileRepository.merge(profile, rest)

    if (fullName || avatarUrl || coverPhotoUrl) {
      const updatedUser = await this.userRepository.findById(user.payload.id)
      if (!updatedUser) throw new BadRequestError(MESSAGES.ACCOUNT_NOT_FOUND)
      updatedUser.fullName = fullName
      updatedUser.avatarUrl = avatarUrl || ''
      updatedUser.coverPhotoUrl = coverPhotoUrl || ''
      await this.userRepository.save(updatedUser)
    }

    const result = await this.profileRepository.save(updatedUser)
    return ProfileDTO.parse(result)
  }
}
