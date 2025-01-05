import { Address } from '@/model/Address'
import { AppDataSource } from '@/config/database'

const AddressRepository = AppDataSource.getRepository(Address).extend({
  async findByUserId(userId: string) {
    return this.find({ where: { userId } })
  },
  async findByIdAndUserId(id: string, userId: string) {
    return this.findOne({ where: { id, userId } })
  },
  async countByUserId(userId: string) {
    return this.count({ where: { userId } })
  }
})
export default AddressRepository
