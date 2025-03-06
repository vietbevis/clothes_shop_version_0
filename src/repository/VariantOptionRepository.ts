import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { VariantOption } from '@/model/VariantOption'
import { Repository } from 'typeorm'

@Injectable()
export class VariantOptionRepository extends Repository<VariantOption> {
  constructor() {
    super(VariantOption, AppDataSource.manager)
  }

  async findByValueAndVariant(value: string, variantId: string) {
    return this.findOneBy({ value, variant: { id: variantId } })
  }
}
