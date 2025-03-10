import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { ProductController } from '@/controller/ProductController'
import { validateRequest } from '@/middleware/validateRequest'
import { GetProductPaginationQuerySchema, ProductSchema } from '@/validation/ProductSchema'
import { IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'
import { resolveInstance } from '@/container'

const ProductRoute = Router()

ProductRoute.post(
  '/',
  validateRequest({ body: ProductSchema }),
  authMiddleware,
  resolveInstance(ProductController, 'createProduct')
)
ProductRoute.put(
  '/:id',
  validateRequest({ body: ProductSchema, params: IdParamsSchema }),
  authMiddleware,
  resolveInstance(ProductController, 'updateProduct')
)
ProductRoute.get(
  '/',
  validateRequest({ query: GetProductPaginationQuerySchema }),
  resolveInstance(ProductController, 'getProducts')
)
ProductRoute.get(
  '/:slug',
  validateRequest({ params: SlugParamsSchema }),
  resolveInstance(ProductController, 'getProductBySlug')
)
export default ProductRoute
