import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Profile } from '@/model/Profile'
import { Repository } from 'typeorm'

@Injectable()
export class ProfileRepository extends Repository<Profile> {
  constructor() {
    super(Profile, AppDataSource.manager)
  }

  async findByUserId(userId: string) {
    return this.findOneBy({ userId })
  }
}
