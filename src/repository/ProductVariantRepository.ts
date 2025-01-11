import { AppDataSource } from '@/config/database'
import { ProductVariant } from '@/model/ProductVariant'

const ProductVariantRepository = AppDataSource.getRepository(ProductVariant).extend({})

export type TProductVariantRepository = typeof ProductVariantRepository
export default ProductVariantRepository
