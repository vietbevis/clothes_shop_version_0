import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { ProductAttribute } from '@/model/ProductAttribute'
import { Repository } from 'typeorm'

@Injectable()
export class ProductAttributeRepository extends Repository<ProductAttribute> {
  constructor() {
    super(ProductAttribute, AppDataSource.manager)
  }
}
