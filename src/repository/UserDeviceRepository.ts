import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { UserDevice } from '@/model/UserDevice'
import { Repository } from 'typeorm'

@Injectable()
export class UserDeviceRepository extends Repository<UserDevice> {
  constructor() {
    super(UserDevice, AppDataSource.manager)
  }

  async findDeviceByUserIdAndDeviceId(userId: string, deviceId: string) {
    return this.findOne({
      where: { userId, deviceId }
    })
  }
}
