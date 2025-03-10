import { Router } from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import { CreateShopSchema, UpdateShopSchema } from '@/validation/ShopSchema'
import { authMiddleware } from '@/middleware/authMiddleware'
import { ShopController } from '@/controller/ShopController'
import {
  ApproveQuerySchema,
  IdParamsSchema,
  PaginationQuerySchema,
  SeachSchema,
  SlugParamsSchema
} from '@/validation/CommonSchema'
import { resolveInstance } from '@/container'

const ShopRoute = Router()

ShopRoute.post(
  '/',
  validateRequest({ body: CreateShopSchema }),
  authMiddleware,
  resolveInstance(ShopController, 'createShop')
)
ShopRoute.put(
  '/',
  validateRequest({ body: UpdateShopSchema }),
  authMiddleware,
  resolveInstance(ShopController, 'updateShop')
)
ShopRoute.get(
  '/:slug',
  validateRequest({ params: SlugParamsSchema }),
  resolveInstance(ShopController, 'getShopByShopSlug')
)
ShopRoute.put(
  '/:id/approve',
  validateRequest({ params: IdParamsSchema, query: ApproveQuerySchema }),
  authMiddleware,
  resolveInstance(ShopController, 'approveShop')
)
ShopRoute.get(
  '/',
  validateRequest({ query: PaginationQuerySchema.merge(SeachSchema) }),
  resolveInstance(ShopController, 'getAllShops')
)

export default ShopRoute
