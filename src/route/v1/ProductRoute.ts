import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { ProductController } from '@/controller/ProductController'
import { validateRequest } from '@/middleware/validateRequest'
import { GetProductPaginationQuerySchema, ProductSchema } from '@/validation/ProductSchema'
import { IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'
import { resolveController } from '@/container'

const ProductRoute = Router()

ProductRoute.post(
  '/',
  validateRequest({ body: ProductSchema }),
  authMiddleware,
  resolveController(ProductController, 'createProduct')
)
ProductRoute.put(
  '/:id',
  validateRequest({ body: ProductSchema, params: IdParamsSchema }),
  authMiddleware,
  resolveController(ProductController, 'updateProduct')
)
ProductRoute.get(
  '/',
  validateRequest({ query: GetProductPaginationQuerySchema }),
  resolveController(ProductController, 'getProducts')
)
ProductRoute.get(
  '/:slug',
  validateRequest({ params: SlugParamsSchema }),
  resolveController(ProductController, 'getProductBySlug')
)
export default ProductRoute
