import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Variant } from '@/model/Variant'
import { Repository } from 'typeorm'

@Injectable()
export class VariantRepository extends Repository<Variant> {
  constructor() {
    super(Variant, AppDataSource.manager)
  }

  async findByName(name: string) {
    return this.findOneBy({ name })
  }
}
