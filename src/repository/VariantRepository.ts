import { AppDataSource } from '@/config/database'
import { Variant } from '@/model/Variant'

const VariantRepository = AppDataSource.getRepository(Variant).extend({
  async findByName(name: string) {
    return this.findOneBy({ name })
  }
})

export type TVariantRepository = typeof VariantRepository
export default VariantRepository
