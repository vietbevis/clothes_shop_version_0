import { Request, Response } from 'express'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { IdParamsType } from '@/validation/CommonSchema'
import { OkResponse } from '@/core/SuccessResponse'
import addressService from '@/service/AddressService'

class AddressController {
  async getAddress(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await addressService.getAddress(req.user)
    new OkResponse('Address data', result).send(res)
  }

  async getAddressById(req: Request<IdParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await addressService.getAddressById(req.user, req.params.id)
    new OkResponse('Address data', result).send(res)
  }

  async setAddressDefault(req: Request<IdParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await addressService.setAddressDefault(req.user, req.params.id)
    new OkResponse('Address default set', result).send(res)
  }

  async addAddress(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await addressService.addAddress(req.user, req.body)
    new OkResponse('Address added', result).send(res)
  }

  async deleteAddress(req: Request<IdParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    await addressService.deleteAddress(req.user, req.params.id)
    new OkResponse('Address deleted').send(res)
  }

  async updateAddress(req: Request<IdParamsType>, res: Response) {
    if (!req.user) throw new UnauthorizedError()
    const result = await addressService.updateAddress(req.user, req.params.id, req.body)
    new OkResponse('Address updated', result).send(res)
  }
}

const addressController = new AddressController()
export default addressController
