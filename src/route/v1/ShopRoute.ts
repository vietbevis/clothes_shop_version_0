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
import { resolveController } from '@/container'

const ShopRoute = Router()

ShopRoute.post(
  '/',
  validateRequest({ body: CreateShopSchema }),
  authMiddleware,
  resolveController(ShopController, 'createShop')
)
ShopRoute.put(
  '/',
  validateRequest({ body: UpdateShopSchema }),
  authMiddleware,
  resolveController(ShopController, 'updateShop')
)
ShopRoute.get(
  '/:slug',
  validateRequest({ params: SlugParamsSchema }),
  resolveController(ShopController, 'getShopByShopSlug')
)
ShopRoute.put(
  '/:id/approve',
  validateRequest({ params: IdParamsSchema, query: ApproveQuerySchema }),
  authMiddleware,
  resolveController(ShopController, 'approveShop')
)
ShopRoute.get(
  '/',
  validateRequest({ query: PaginationQuerySchema.merge(SeachSchema) }),
  resolveController(ShopController, 'getAllShops')
)

export default ShopRoute
