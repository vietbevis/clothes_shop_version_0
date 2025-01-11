import { AppDataSource } from '@/config/database'
import { VariantOption } from '@/model/VariantOption'

const VariantOptionRepository = AppDataSource.getRepository(VariantOption).extend({
  async findByValueAndVariant(value: string, variantId: string) {
    return this.findOneBy({ value, variant: { id: variantId } })
  }
})

export type TVariantOptionRepository = typeof VariantOptionRepository
export default VariantOptionRepository
