import { Router } from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import { CreateCategorySchema, GetCategoriesSchema, UpdateCategorySchema } from '@/validation/CategorySchema'
import { CategoryController } from '@/controller/CategoryController'
import { authMiddleware } from '@/middleware/authMiddleware'
import { IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'
import { resolveController } from '@/container'

const CategoryRoute = Router()

CategoryRoute.post(
  '/',
  validateRequest({ body: CreateCategorySchema }),
  authMiddleware,
  resolveController(CategoryController, 'createCategory')
)
CategoryRoute.put(
  '/:id',
  validateRequest({ body: UpdateCategorySchema, params: IdParamsSchema }),
  authMiddleware,
  resolveController(CategoryController, 'updateCategory')
)
CategoryRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveController(CategoryController, 'deleteCategory')
)
CategoryRoute.get(
  '/',
  validateRequest({ query: GetCategoriesSchema }),
  resolveController(CategoryController, 'getCategories')
)
CategoryRoute.get(
  '/:slug',
  validateRequest({ params: SlugParamsSchema }),
  resolveController(CategoryController, 'getCategoryBySlug')
)

export default CategoryRoute
