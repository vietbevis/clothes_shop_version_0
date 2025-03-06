import { ShopService } from '@/service/ShopService'
import { Request, Response } from 'express'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'
import { BadRequestError } from '@/core/ErrorResponse'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}
  async createShop(req: Request, res: Response) {
    const result = await this.shopService.createShop(req.body, req.user)
    new OkResponse('Shop created', omitFields(result, ['userId'])).send(res)
  }

  async updateShop(req: Request, res: Response) {
    const result = await this.shopService.updateShop(req.body, req.user)
    new OkResponse('Shop updated', omitFields(result, ['userId'])).send(res)
  }

  async changeShopStatus(req: Request, res: Response) {
    await this.shopService.changeShopStatus(req.params.status as any, req.user)
    new OkResponse('Shop status updated').send(res)
  }

  async approveShop(req: Request, res: Response) {
    await this.shopService.approveShop(req.params.id, req.query.status as any)
    new OkResponse('Shop approved').send(res)
  }

  async getShopByShopSlug(req: Request, res: Response) {
    const result = await this.shopService.getShopByShopSlug(req.params.slug)
    if (!result) throw new BadRequestError('Shop not found')
    new OkResponse('Shop found', omitFields(result, ['userId'])).send(res)
  }

  async getAllShops(req: Request, res: Response) {
    const search = req.query.search as string
    const result = await this.shopService.getAllShops(search, req)
    new OkResponse('Shops found', omitFields(result, ['userId'])).send(res)
  }
}
