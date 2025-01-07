import categoryService from '@/service/CategoryService'
import { Request, Response } from 'express'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'

class CategoryController {
  async createCategory(req: Request, res: Response) {
    const result = await categoryService.create(req.body, req.user)
    new OkResponse('Category created', omitFields(result, [])).send(res)
  }
}

const categoryController = new CategoryController()
export default categoryController
