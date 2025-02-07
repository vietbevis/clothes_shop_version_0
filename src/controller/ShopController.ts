import shopService from '@/service/ShopService'
import { Request, Response } from 'express'
import { OkResponse } from '@/core/SuccessResponse'
import { omitFields } from '@/utils/helper'
import { BadRequestError } from '@/core/ErrorResponse'

class ShopController {
  async createShop(req: Request, res: Response) {
    const result = await shopService.createShop(req.body, req.user)
    new OkResponse('Shop created', omitFields(result, ['userId'])).send(res)
  }

  async updateShop(req: Request, res: Response) {
    const result = await shopService.updateShop(req.body, req.user)
    new OkResponse('Shop updated', omitFields(result, ['userId'])).send(res)
  }

  async changeShopStatus(req: Request, res: Response) {
    await shopService.changeShopStatus(req.params.status as any, req.user)
    new OkResponse('Shop status updated').send(res)
  }

  async approveShop(req: Request, res: Response) {
    await shopService.approveShop(req.params.id, req.query.status as any)
    new OkResponse('Shop approved').send(res)
  }

  async updateAddressShop(req: Request, res: Response) {
    const result = await shopService.updateAddressShop(req.body, req.user)
    new OkResponse('Shop address updated', omitFields(result, ['userId'])).send(res)
  }

  async getShopByOwner(req: Request, res: Response) {
    const result = await shopService.getShopByOwner(req.params.username)
    if (!result) throw new BadRequestError('Shop not found')
    new OkResponse('Shop found', omitFields(result, ['userId'])).send(res)
  }

  async getAllShops(req: Request, res: Response) {
    const search = req.query.search as string
    const result = await shopService.getAllShops(search, req)
    new OkResponse('Shops found', omitFields(result, ['userId'])).send(res)
  }
}

const shopController = new ShopController()
export default shopController
