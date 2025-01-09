import { AppDataSource } from '@/config/database'
import { Shop } from '@/model/Shop'
import { FindOptionsRelations } from 'typeorm'

const ShopRepository = AppDataSource.getRepository(Shop).extend({
  async findByOwner(ownerId: string, relations?: FindOptionsRelations<Shop>) {
    return this.findOne({ where: { owner: { id: ownerId } }, relations })
  },
  async findByOwnerUsername(username: string, relations?: FindOptionsRelations<Shop>) {
    return this.findOne({ where: { owner: { username } }, relations })
  },
  async findById(id: string) {
    return this.findOneBy({ id })
  }
})

export default ShopRepository
