import { AppDataSource } from '@/config/database'
import { AttributeValue } from '@/model/AttributeValue'

const AttributeValueRepository = AppDataSource.getRepository(AttributeValue).extend({
  async findByValue(value: string) {
    return this.findOneBy({ value })
  }
})

export type TAttributeValueRepository = typeof AttributeValueRepository
export default AttributeValueRepository
