import { CategoryService } from '@/service/CategoryService'
import { Request, Response } from 'express'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async createCategory(req: Request, res: Response) {
    const result = await this.categoryService.create(req.body)
    new OkResponse('Category created', result).send(res)
  }

  async updateCategory(req: Request, res: Response) {
    const result = await this.categoryService.update(req.params.id, req.body)
    new OkResponse('Category updated', result).send(res)
  }

  async deleteCategory(req: Request, res: Response) {
    await this.categoryService.delete(req.params.id)
    new OkResponse('Category deleted').send(res)
  }

  async getCategories(req: Request, res: Response) {
    const name = req.query.name as string
    const parentId = req.query.parentId as string
    const result = await this.categoryService.getCategoies(name, parentId, req)
    new OkResponse('Categories retrieved', result).send(res)
  }

  async getCategoryBySlug(req: Request, res: Response) {
    const result = await this.categoryService.getCategoryBySlug(req.params.slug)
    new OkResponse('Category retrieved', result).send(res)
  }
}
