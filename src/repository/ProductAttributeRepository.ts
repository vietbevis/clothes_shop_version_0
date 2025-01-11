import { AppDataSource } from '@/config/database'
import { ProductAttribute } from '@/model/ProductAttribute'

const ProductAttributeRepository = AppDataSource.getRepository(ProductAttribute).extend({})

export type TProductAttributeRepository = typeof ProductAttributeRepository
export default ProductAttributeRepository
