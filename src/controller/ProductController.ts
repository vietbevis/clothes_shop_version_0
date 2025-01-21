import { Request, Response } from 'express'
import productService from '@/service/ProductService'
import { OkResponse } from '@/core/SuccessResponse'

class ProductController {
  async createProduct(req: Request, res: Response) {
    const result = await productService.createProduct(req.body, req.user)
    new OkResponse('Product created', result).send(res)
  }

  async getProduct(req: Request, res: Response) {
    const result = await productService.getProduct(req.params.slug)
    new OkResponse('Product found', result).send(res)
  }

  async getProductByShopSlug(req: Request, res: Response) {
    const result = await productService.getProductByShopSlug(req.params.slug, req)
    new OkResponse('Product found', result).send(res)
  }

  async getProducts(req: Request, res: Response) {
    const result = await productService.getProducts(req)
    new OkResponse('Product found', result).send(res)
  }
}

const productController = new ProductController()
export default productController
