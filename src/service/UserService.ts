import { User } from '@/model/User'
import { omitFields } from '@/utils/helper'
import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError } from '@/core/ErrorResponse'
import { UpdateProfileType } from '@/validation/CommonSchema'
import { ProfileRepository } from '@/repository/ProfileRepository'
import { MESSAGES } from '@/utils/message'
import { DecodedJwtToken } from './JwtService'
import { Injectable } from '@/decorators/inject'
import { ProfileDTO, UserDTO } from '@/dtos/UserDTO'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository
  ) {}

  async getMe(user: DecodedJwtToken) {
    const result = await this.userRepository.findById(user.payload.id, { profile: true })
    if (!result) throw new BadRequestError()
    return UserDTO.safeParse(result).data
  }

  async getUserByUsername(username: string) {
    const result = await this.userRepository.findByUsernameAndActiveProfile(username)
    if (!result) throw new BadRequestError('User not found')
    return UserDTO.safeParse(result).data
  }

  async updateProfile(user: DecodedJwtToken, data: UpdateProfileType) {
    const profile = await this.profileRepository.findByUserId(user.payload.id)
    if (!profile) throw new BadRequestError(MESSAGES.ACCOUNT_NOT_FOUND)
    const updatedUser = this.profileRepository.merge(profile, data)
    const result = await this.profileRepository.save(updatedUser)
    return ProfileDTO.safeParse(result).data
  }
}
