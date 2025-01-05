import { AppDataSource } from '@/config/database'
import { User } from '@/model/User'
import { FindOptionsRelations } from 'typeorm'
import { UserStatus } from '@/utils/enums'
import ms from 'ms'
import envConfig from '@/config/envConfig'
import { Profile } from '@/model/Profile'

export const UserRepository = AppDataSource.getRepository(User).extend({
  async findById(id: string, relations?: FindOptionsRelations<User>): Promise<User | null> {
    return this.findOne({ where: { id }, relations })
  },
  async loadUserByEmail(email: string, relations?: FindOptionsRelations<User>): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations,
      cache: { id: 'loaded_user', milliseconds: ms(envConfig.ACCESS_TOKEN_EXPIRES_IN) }
    })
  },
  async findByUsername(username: string, relations?: FindOptionsRelations<User>): Promise<User | null> {
    return this.findOne({ where: { username }, relations })
  },
  async findByEmail(email: string, relations?: FindOptionsRelations<User>): Promise<User | null> {
    return this.findOne({ where: { email }, relations })
  },
  async changeStatus(email: string, status: UserStatus) {
    return this.update({ email }, { status })
  },
  async changePassword(email: string, password: string) {
    return this.update({ email }, { password })
  },
  async findByUsernameAndActiveProfile(username: string, relations?: FindOptionsRelations<User>): Promise<User | null> {
    const user = await this.findOne({
      where: { username },
      relations: { profile: true, ...relations }
    })
    if (user) {
      if (!user.profile.isPublic) user.profile = new Profile()
      return user
    }
    return null
  }
})
