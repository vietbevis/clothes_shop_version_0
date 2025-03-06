import { Request, Response } from 'express'
import { ProductService } from '@/service/ProductService'
import { OkResponse } from '@/core/SuccessResponse'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async createProduct(req: Request, res: Response) {
    const result = await this.productService.createProduct(req.body, req.user)
    new OkResponse('Product created', result).send(res)
  }

  async getProductBySlug(req: Request, res: Response) {
    const result = await this.productService.getProductBySlug(req.params.slug)
    new OkResponse('Product found', result).send(res)
  }

  async getProducts(req: Request, res: Response) {
    const result = await this.productService.getProducts(req)
    new OkResponse('Product found', result).send(res)
  }

  async updateProduct(req: Request, res: Response) {
    const result = await this.productService.updateProduct(req.params.id, req.body, req.user)
    new OkResponse('Product updated', result).send(res)
  }
}
