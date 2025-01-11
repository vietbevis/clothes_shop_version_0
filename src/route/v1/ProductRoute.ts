import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import asyncHandler from '@/middleware/asyncHandler'
import productController from '@/controller/ProductController'
import { validateRequest } from '@/middleware/validateRequest'
import { ProductSchema } from '@/validation/ProductSchema'
import { SlugParamsSchema } from '@/validation/CommonSchema'

const ProductRoute = Router()

// generate openapi docs
/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */
ProductRoute.post(
  '/',
  validateRequest({ body: ProductSchema }),
  authMiddleware,
  asyncHandler(productController.createProduct)
)

// generate openapi docs get product by slug
/**
 * @swagger
 * /v1/products/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         description: Product slug
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */
ProductRoute.get('/:slug', validateRequest({ params: SlugParamsSchema }), asyncHandler(productController.getProduct))

/**
 * @swagger
 * /v1/products/shop/{slug}:
 *   get:
 *     summary: Get all products by shop slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         description: Shop slug
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
 *           example: 'ASC'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProductResponse'
 */
ProductRoute.get(
  '/shop/:slug',
  validateRequest({ params: SlugParamsSchema }),
  asyncHandler(productController.getProductByShopSlug)
)
export default ProductRoute
