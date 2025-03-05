import { AppDataSource } from '@/config/database'
import { UserDevice } from '@/model/UserDevice'

export const UserDeviceRepository = AppDataSource.getRepository(UserDevice).extend({
  async findDeviceByUserIdAndDeviceId(userId: string, deviceId: string) {
    return this.findOne({
      where: { userId, deviceId }
    })
  }
})
