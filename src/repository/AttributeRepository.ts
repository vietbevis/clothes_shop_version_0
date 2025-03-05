import { AppDataSource } from '@/config/database'
import { Attribute } from '@/model/Attribute'

const AttributeRepository = AppDataSource.getRepository(Attribute).extend({})

export type TAttributeRepository = typeof AttributeRepository
export default AttributeRepository
