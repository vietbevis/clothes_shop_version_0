import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import asyncHandler from '@/middleware/asyncHandler'
import productController from '@/controller/ProductController'
import { validateRequest } from '@/middleware/validateRequest'
import { ProductSchema } from '@/validation/ProductSchema'
import { GetProductPaginationQuerySchema, IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'

const ProductRoute = Router()

ProductRoute.post(
  '/',
  validateRequest({ body: ProductSchema }),
  authMiddleware,
  asyncHandler(productController.createProduct)
)
ProductRoute.put(
  '/:id',
  validateRequest({ body: ProductSchema, params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(productController.updateProduct)
)
ProductRoute.get(
  '/',
  validateRequest({ query: GetProductPaginationQuerySchema }),
  asyncHandler(productController.getProducts)
)
ProductRoute.get('/:slug', validateRequest({ params: SlugParamsSchema }), asyncHandler(productController.getProduct))
// ProductRoute.get(
//   '/shop/:slug',
//   validateRequest({ params: SlugParamsSchema, query: GetProductPaginationQuerySchema }),
//   asyncHandler(productController.getProductByShopSlug)
// )
export default ProductRoute
