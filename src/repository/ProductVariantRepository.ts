import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { ProductVariant } from '@/model/ProductVariant'
import { Repository } from 'typeorm'

@Injectable()
export class ProductVariantRepository extends Repository<ProductVariant> {
  constructor() {
    super(ProductVariant, AppDataSource.manager)
  }
}
