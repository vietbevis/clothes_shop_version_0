import { AppDataSource } from '@/config/database'
import { AttributeValue } from '@/model/AttributeValue'
import { Repository } from 'typeorm'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class AttributeValueRepository extends Repository<AttributeValue> {
  constructor() {
    super(AttributeValue, AppDataSource.manager)
  }

  async findByValue(value: string) {
    return this.findOneBy({ value })
  }
}
