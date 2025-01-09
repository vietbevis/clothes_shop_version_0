import categoryService from '@/service/CategoryService'
import { Request, Response } from 'express'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'

class CategoryController {
  async createCategory(req: Request, res: Response) {
    const result = await categoryService.create(req.body, req.user)
    new OkResponse('Category created', omitFields(result, [])).send(res)
  }

  async updateCategory(req: Request, res: Response) {
    const result = await categoryService.update(req.params.id, req.body, req.user)
    new OkResponse('Category updated', omitFields(result, [])).send(res)
  }

  async deleteCategory(req: Request, res: Response) {
    await categoryService.delete(req.params.id)
    new OkResponse('Category deleted').send(res)
  }

  async getCategories(req: Request, res: Response) {
    const result = await categoryService.getCategories(parseInt((req.query.depth as string) || '1'))
    new OkResponse('Categories retrieved', result).send(res)
  }

  async getCategoryBySlug(req: Request, res: Response) {
    const result = await categoryService.getCategoryBySlug(
      req.params.slug,
      parseInt((req.query.depth as string) || '1')
    )
    new OkResponse('Category retrieved', result).send(res)
  }
}

const categoryController = new CategoryController()
export default categoryController
