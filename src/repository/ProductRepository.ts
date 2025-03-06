import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Product } from '@/model/Product'
import { FindOptionsRelations, Repository } from 'typeorm'

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor() {
    super(Product, AppDataSource.manager)
  }

  async findBySlug(slug: string, relations?: FindOptionsRelations<Product>) {
    return this.findOne({ where: { slug }, relations })
  }

  async findById(id: string, relations?: FindOptionsRelations<Product>) {
    return this.findOne({ where: { id }, relations })
  }

  async findByShopSlug(slug: string, relations?: FindOptionsRelations<Product>) {
    return this.find({ where: { shop: { slug } }, relations })
  }

  async findByIdAndShopId(id: string, shopId: string, relations?: FindOptionsRelations<Product>) {
    return this.findOne({ where: { id, shop: { id: shopId } }, relations })
  }
}
