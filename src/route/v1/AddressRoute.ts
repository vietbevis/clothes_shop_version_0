import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { validateRequest } from '@/middleware/validateRequest'
import { AddressSchema, UpdateAddressSchema } from '@/validation/AddressSchema'
import { IdParamsSchema } from '@/validation/CommonSchema'
import { resolveInstance } from '@/container'
import { AddressController } from '@/controller/AddressController'

const AddressRoute = Router()

AddressRoute.get('/', authMiddleware, resolveInstance(AddressController, 'getAddress'))
AddressRoute.get(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveInstance(AddressController, 'getAddressById')
)
AddressRoute.post(
  '/',
  validateRequest({ body: AddressSchema }),
  authMiddleware,
  resolveInstance(AddressController, 'addAddress')
)
AddressRoute.put(
  '/:id/set-default',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveInstance(AddressController, 'setAddressDefault')
)
AddressRoute.put(
  '/:id',
  validateRequest({ params: IdParamsSchema, body: UpdateAddressSchema }),
  authMiddleware,
  resolveInstance(AddressController, 'updateAddress')
)
AddressRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveInstance(AddressController, 'deleteAddress')
)
export default AddressRoute
