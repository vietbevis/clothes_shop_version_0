import { Router } from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import { CreateShopSchema, UpdateShopSchema, UpdateShopStatusSchema } from '@/validation/ShopSchema'
import { authMiddleware } from '@/middleware/authMiddleware'
import shopController from '@/controller/ShopController'
import asyncHandler from '@/middleware/asyncHandler'
import {
  ApproveQuerySchema,
  IdParamsSchema,
  PaginationQuerySchema,
  SeachSchema,
  SlugParamsSchema
} from '@/validation/CommonSchema'

const ShopRoute = Router()

ShopRoute.post(
  '/',
  validateRequest({ body: CreateShopSchema }),
  authMiddleware,
  asyncHandler(shopController.createShop)
)
ShopRoute.put('/', validateRequest({ body: UpdateShopSchema }), authMiddleware, asyncHandler(shopController.updateShop))
ShopRoute.get('/:slug', validateRequest({ params: SlugParamsSchema }), asyncHandler(shopController.getShopByShopSlug))
ShopRoute.put(
  '/:status/change-status',
  validateRequest({ params: UpdateShopStatusSchema }),
  authMiddleware,
  asyncHandler(shopController.changeShopStatus)
)
ShopRoute.put(
  '/:id/approve',
  validateRequest({ params: IdParamsSchema, query: ApproveQuerySchema }),
  authMiddleware,
  asyncHandler(shopController.approveShop)
)
ShopRoute.get(
  '/',
  validateRequest({ query: PaginationQuerySchema.merge(SeachSchema) }),
  asyncHandler(shopController.getAllShops)
)

export default ShopRoute
