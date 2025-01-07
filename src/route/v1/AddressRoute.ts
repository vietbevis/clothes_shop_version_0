import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import asyncHandler from '@/middleware/asyncHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { AddressSchema } from '@/validation/AddressSchema'
import { IdParamsSchema } from '@/validation/CommonSchema'
import addressController from '@/controller/AddressController'

const AddressRoute = Router()

/**
 * @openapi
 * /v1/address:
 *  get:
 *    summary: Get all addresses
 *    tags: [Address]
 *    responses:
 *      200:
 *        description: Get all addresses
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AddressesResponse'
 */
AddressRoute.get('/', authMiddleware, asyncHandler(addressController.getAddress))

/**
 * @openapi
 * /v1/address/{id}:
 *  get:
 *    summary: Get address by id
 *    tags: [Address]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Get address by id
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AddressesResponse'
 */
AddressRoute.get(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(addressController.getAddressById)
)

/**
 * @openapi
 * /v1/address:
 *  post:
 *    summary: Add new address
 *    tags: [Address]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/AddressSchema'
 *    responses:
 *      200:
 *        description: Add new address
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AddressesResponse'
 */
AddressRoute.post(
  '/',
  validateRequest({ body: AddressSchema }),
  authMiddleware,
  asyncHandler(addressController.addAddress)
)

/**
 * @openapi
 * /v1/address/default/{id}:
 *  put:
 *    summary: Set address default
 *    tags: [Address]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Set address default
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AddressesResponse'
 */
AddressRoute.put(
  '/default/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(addressController.setAddressDefault)
)

/**
 * @openapi
 * /v1/address/{id}:
 *  put:
 *    summary: Update address
 *    tags: [Address]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/AddressSchema'
 *    responses:
 *      200:
 *        description: Update address
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/AddressesResponse'
 */
AddressRoute.put(
  '/:id',
  validateRequest({ params: IdParamsSchema, body: AddressSchema }),
  authMiddleware,
  asyncHandler(addressController.updateAddress)
)

/**
 * @openapi
 * /v1/address/{id}:
 *  delete:
 *    summary: Delete address
 *    tags: [Address]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Delete address
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/BaseResponse'
 */
AddressRoute.delete(
  '/:id',
  validateRequest({ params: IdParamsSchema }),
  authMiddleware,
  asyncHandler(addressController.deleteAddress)
)
export default AddressRoute
