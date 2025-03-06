import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Shop } from '@/model/Shop'
import { FindOptionsRelations, Repository } from 'typeorm'

@Injectable()
export class ShopRepository extends Repository<Shop> {
  constructor() {
    super(Shop, AppDataSource.manager)
  }

  async findByOwner(ownerId: string, relations?: FindOptionsRelations<Shop>) {
    return this.findOne({ where: { owner: { id: ownerId } }, relations })
  }

  async findByShopSlug(slug: string, relations?: FindOptionsRelations<Shop>) {
    return this.findOne({ where: { slug }, relations })
  }

  async findById(id: string) {
    return this.findOneBy({ id })
  }
}
