import { Router } from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import { CreateCategorySchema, UpdateCategorySchema } from '@/validation/CategorySchema'
import categoryController from '@/controller/CategoryController'
import { authMiddleware } from '@/middleware/authMiddleware'
import asyncHandler from '@/middleware/asyncHandler'
import { DepthQuerySchema, IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'

const CategoryRoute = Router()

/**
 * @openapi
 * /v1/categories:
 *   post:
 *     summary: Create category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateCategoryResponse'
 */
CategoryRoute.post(
  '/',
  validateRequest({ body: CreateCategorySchema }),
  authMiddleware,
  asyncHandler(categoryController.createCategory)
)

/**
 * @openapi
 * /v1/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateCategoryResponse'
 */
CategoryRoute.put(
  '/:id',
  validateRequest({ body: UpdateCategorySchema, params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(categoryController.updateCategory)
)

/**
 * @openapi
 * /v1/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
CategoryRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(categoryController.deleteCategory)
)

/**
 * @openapi
 * /v1/categories:
 *   get:
 *     summary: Get categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: depth
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *           maximum: 5
 *     responses:
 *       200:
 *         description: Categories retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCategoriesResponse'
 */
CategoryRoute.get('/', validateRequest({ query: DepthQuerySchema }), asyncHandler(categoryController.getCategories))

/**
 * @openapi
 * /v1/categories/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: depth
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *           maximum: 5
 *     responses:
 *       200:
 *         description: Category retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCategoryResponse'
 */
CategoryRoute.get(
  '/:slug',
  validateRequest({ query: DepthQuerySchema, params: SlugParamsSchema }),
  asyncHandler(categoryController.getCategoryBySlug)
)

export default CategoryRoute
