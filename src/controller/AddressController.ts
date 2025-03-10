import { Request, Response } from 'express'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { IdParamsType } from '@/validation/CommonSchema'
import { OkResponse } from '@/core/SuccessResponse'
import { AddressService } from '@/service/AddressService'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  async getAddress(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await this.addressService.getAddress(req.user)
    new OkResponse('Address data', result).send(res)
  }

  async getAddressById(req: Request<IdParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await this.addressService.getAddressById(req.user, req.params.id)
    new OkResponse('Address data', result).send(res)
  }

  async setAddressDefault(req: Request<IdParamsType>, res: Response) {
    const result = await this.addressService.setAddressDefault(req.user, req.params.id)
    new OkResponse('Address default set', result).send(res)
  }

  async addAddress(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await this.addressService.addAddress(req.user, req.body)
    new OkResponse('Address added', result).send(res)
  }

  async deleteAddress(req: Request<IdParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    await this.addressService.deleteAddress(req.user, req.params.id)
    new OkResponse('Address deleted').send(res)
  }

  async updateAddress(req: Request<IdParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await this.addressService.updateAddress(req.user, req.params.id, req.body)
    new OkResponse('Address updated', result).send(res)
  }
}
