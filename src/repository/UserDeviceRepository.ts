import { AppDataSource } from '@/config/database'
import { UserDevice } from '@/model/UserDevice'

export const UserDeviceRepository = AppDataSource.getRepository(UserDevice).extend({
  async findActiveDeviceByUserEmailAndDeviceInfo(email: string, deviceName: string, deviceType: string) {
    return this.findOne({
      where: { user: { email }, deviceName, deviceType, isActive: true }
    })
  }
})
