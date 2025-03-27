import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { validateRequest } from '@/middleware/validateRequest'
import { AddressSchema, UpdateAddressSchema } from '@/validation/AddressSchema'
import { IdParamsSchema } from '@/validation/CommonSchema'
import { resolveController } from '@/container'
import { AddressController } from '@/controller/AddressController'

const AddressRoute = Router()

AddressRoute.get('/', authMiddleware, resolveController(AddressController, 'getAddress'))
AddressRoute.get(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveController(AddressController, 'getAddressById')
)
AddressRoute.post(
  '/',
  validateRequest({ body: AddressSchema }),
  authMiddleware,
  resolveController(AddressController, 'addAddress')
)
AddressRoute.put(
  '/:id/set-default',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveController(AddressController, 'setAddressDefault')
)
AddressRoute.put(
  '/:id',
  validateRequest({ params: IdParamsSchema, body: UpdateAddressSchema }),
  authMiddleware,
  resolveController(AddressController, 'updateAddress')
)
AddressRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  resolveController(AddressController, 'deleteAddress')
)
export default AddressRoute
