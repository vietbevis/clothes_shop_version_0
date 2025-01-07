import { AppDataSource } from '@/config/database'
import { Product } from '@/model/Product'

const ProductRepository = AppDataSource.getRepository(Product).extend({})

export default ProductRepository
