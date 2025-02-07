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
  UsernameParamsSchema
} from '@/validation/CommonSchema'
import { AddressSchema } from '@/validation/AddressSchema'

const ShopRoute = Router()

/**
 * @openapi
 * /v1/shops:
 *   post:
 *     summary: Create shop
 *     tags: [Shops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShopRequest'
 *     responses:
 *       200:
 *         description: Shop created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateShopResponse'
 */
ShopRoute.post(
  '/',
  validateRequest({ body: CreateShopSchema }),
  authMiddleware,
  asyncHandler(shopController.createShop)
)

/**
 * @openapi
 * /v1/shops:
 *   put:
 *     summary: Update shop
 *     tags: [Shops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShopRequest'
 *     responses:
 *       200:
 *         description: Shop updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateShopResponse'
 */
ShopRoute.put('/', validateRequest({ body: UpdateShopSchema }), authMiddleware, asyncHandler(shopController.updateShop))

/**
 * @openapi
 * /v1/shops/{username}:
 *   get:
 *     summary: Get shop by owner
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shop found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopResponse'
 */
ShopRoute.get(
  '/:username',
  validateRequest({ params: UsernameParamsSchema }),
  asyncHandler(shopController.getShopByOwner)
)

/**
 * @openapi
 * /v1/shops/change-status/{status}:
 *   put:
 *     summary: Change shop status
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *     responses:
 *       200:
 *         description: Shop status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
ShopRoute.put(
  '/change-status/:status',
  validateRequest({ params: UpdateShopStatusSchema }),
  authMiddleware,
  asyncHandler(shopController.changeShopStatus)
)

/**
 * @openapi
 * /v1/shops/approve/{id}:
 *   put:
 *     summary: Approve shop
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [approved, rejected]
 *     responses:
 *       200:
 *         description: Shop approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
ShopRoute.put(
  '/approve/:id',
  validateRequest({ params: IdParamsSchema, query: ApproveQuerySchema }),
  authMiddleware,
  asyncHandler(shopController.approveShop)
)

/**
 * @openapi
 * /v1/shops/address:
 *   put:
 *     summary: Update shop address
 *     tags: [Shops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddressShopRequest'
 *     responses:
 *       200:
 *         description: Shop address updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddressesResponse'
 */
ShopRoute.put(
  '/address',
  validateRequest({ body: AddressSchema }),
  authMiddleware,
  asyncHandler(shopController.updateAddressShop)
)

/**
 * @openapi
 * /v1/shops:
 *   get:
 *     summary: Get all shops
 *     tags: [Shops]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 24
 *           minimum: 1
 *           maximum: 100
 *           default: 24
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           example: 'createdAt'
 *       - in: query
 *         name: sortDirection
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['ASC', 'DESC']
 *           example: 'DESC'
 *     responses:
 *       200:
 *         description: Shops found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopsResponse'
 */
ShopRoute.get(
  '/',
  validateRequest({ query: PaginationQuerySchema.merge(SeachSchema) }),
  asyncHandler(shopController.getAllShops)
)

export default ShopRoute
