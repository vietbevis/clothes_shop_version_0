import { AppDataSource } from '@/config/database'
import { Profile } from '@/model/Profile'

export const ProfileRepository = AppDataSource.getRepository(Profile).extend({
  async findByUserId(userId: string) {
    return this.findOneBy({ userId })
  }
})
