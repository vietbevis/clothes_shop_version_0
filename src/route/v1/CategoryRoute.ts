import { Router } from 'express'
import { validateRequest } from '@/middleware/validateRequest'
import { CreateCategorySchema, UpdateCategorySchema } from '@/validation/CategorySchema'
import { CategoryController } from '@/controller/CategoryController'
import { authMiddleware } from '@/middleware/authMiddleware'
import { GetCategoriesSchema, IdParamsSchema, SlugParamsSchema } from '@/validation/CommonSchema'
import { resolveInstance } from '@/container'

const CategoryRoute = Router()

CategoryRoute.post(
  '/',
  validateRequest({ body: CreateCategorySchema }),
  authMiddleware,
  resolveInstance(CategoryController, 'createCategory')
)
CategoryRoute.put(
  '/:id',
  validateRequest({ body: UpdateCategorySchema, params: IdParamsSchema }),
  authMiddleware,
  resolveInstance(CategoryController, 'updateCategory')
)
CategoryRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveInstance(CategoryController, 'deleteCategory')
)
CategoryRoute.get(
  '/',
  validateRequest({ query: GetCategoriesSchema }),
  resolveInstance(CategoryController, 'getCategories')
)
CategoryRoute.get(
  '/:slug',
  validateRequest({ params: SlugParamsSchema }),
  resolveInstance(CategoryController, 'getCategoryBySlug')
)

export default CategoryRoute
