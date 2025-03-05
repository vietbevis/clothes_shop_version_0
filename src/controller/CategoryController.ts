import categoryService from '@/service/CategoryService'
import { Request, Response } from 'express'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'

class CategoryController {
  async createCategory(req: Request, res: Response) {
    const result = await categoryService.create(req.body)
    new OkResponse('Category created', omitFields(result, [])).send(res)
  }

  async updateCategory(req: Request, res: Response) {
    const result = await categoryService.update(req.params.id, req.body)
    new OkResponse('Category updated', omitFields(result, [])).send(res)
  }

  async deleteCategory(req: Request, res: Response) {
    await categoryService.delete(req.params.id)
    new OkResponse('Category deleted').send(res)
  }

  async getCategories(req: Request, res: Response) {
    const name = req.query.name as string
    const parentId = req.query.parentId as string
    const result = await categoryService.getCategoiesV2(name, parentId, req)
    new OkResponse('Categories retrieved', result).send(res)
  }

  async getCategoryBySlug(req: Request, res: Response) {
    const result = await categoryService.getCategoryBySlug(req.params.slug)
    new OkResponse('Category retrieved', result).send(res)
  }
}

const categoryController = new CategoryController()
export default categoryController
