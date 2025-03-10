import z from 'zod'
import { BaseDTO, BaseEntityDTO } from './BaseDTO'

export const AddressDTO = z
  .object({
    ...BaseEntityDTO.shape,
    streetNumber: z.string(),
    streetName: z.string(),
    ward: z.string(),
    district: z.string(),
    province: z.string(),
    note: z.string(),
    isDefault: z.boolean()
  })
  .strip()
  .openapi('AddressDTO')

export const ListAddressData = z.array(AddressDTO)

export const ListAddressRes = z
  .object({
    ...BaseDTO.shape,
    data: ListAddressData
  })
  .openapi('ListAddressRes')

export const AddressRes = z
  .object({
    ...BaseDTO.shape,
    data: AddressDTO
  })
  .openapi('AddressRes')
