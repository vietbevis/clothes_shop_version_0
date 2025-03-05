import { Router } from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import { CreateCategorySchema, UpdateCategorySchema } from '@/validation/CategorySchema'
import categoryController from '@/controller/CategoryController'
import { authMiddleware } from '@/middleware/authMiddleware'
import asyncHandler from '@/middleware/asyncHandler'
import { GetCategoriesSchema, IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'

const CategoryRoute = Router()

CategoryRoute.post(
  '/',
  validateRequest({ body: CreateCategorySchema }),
  authMiddleware,
  asyncHandler(categoryController.createCategory)
)
CategoryRoute.put(
  '/:id',
  validateRequest({ body: UpdateCategorySchema, params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(categoryController.updateCategory)
)
CategoryRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(categoryController.deleteCategory)
)
CategoryRoute.get('/', validateRequest({ query: GetCategoriesSchema }), asyncHandler(categoryController.getCategories))
CategoryRoute.get(
  '/:slug',
  validateRequest({ params: SlugParamsSchema }),
  asyncHandler(categoryController.getCategoryBySlug)
)

export default CategoryRoute
