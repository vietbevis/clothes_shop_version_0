import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import asyncHandler from '@/middleware/asyncHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { AddressSchema } from '@/validation/AddressSchema'
import { IdParamsSchema } from '@/validation/CommonSchema'
import addressController from '@/controller/AddressController'

const AddressRoute = Router()

AddressRoute.get('/', authMiddleware, asyncHandler(addressController.getAddress))
AddressRoute.get(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(addressController.getAddressById)
)
AddressRoute.post(
  '/',
  validateRequest({ body: AddressSchema }),
  authMiddleware,
  asyncHandler(addressController.addAddress)
)
AddressRoute.put(
  '/:id/set-default',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(addressController.setAddressDefault)
)
AddressRoute.put(
  '/:id',
  validateRequest({ params: IdParamsSchema, body: AddressSchema }),
  authMiddleware,
  asyncHandler(addressController.updateAddress)
)
AddressRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(addressController.deleteAddress)
)
export default AddressRoute
