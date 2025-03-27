import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'
import { phoneNumberSchema } from './CommonSchema'

extendZodWithOpenApi(z)

export const AddressSchema = z
  .object({
    name: z.string({ message: 'Name can not be blank' }).trim().nonempty(),
    fullName: z.string({ message: 'Full name can not be blank' }).trim().nonempty(),
    phoneNumber: phoneNumberSchema,
    streetNumber: z.string({ message: 'Street number can not be blank' }).trim().nonempty(),
    streetName: z.string({ message: 'Street name can not be blank' }).trim().nonempty(),
    ward: z
      .string({ message: 'Ward can not be blank' })
      .min(3, { message: 'Ward must be at least 3 characters.' })
      .trim()
      .nonempty(),
    district: z
      .string({ message: 'District can not be blank' })
      .min(3, { message: 'District must be at least 3 characters.' })
      .trim()
      .nonempty(),
    province: z
      .string({ message: 'Province can not be blank' })
      .min(3, { message: 'Province must be at least 3 characters.' })
      .trim()
      .nonempty(),
    isDefault: z.boolean().default(false),
    note: z.string().default('')
  })
  .strict()
  .strip()
  .openapi('AddressSchema', {
    example: {
      name: 'Home',
      fullName: 'John Doe',
      phoneNumber: '0123456789',
      streetNumber: '123',
      streetName: 'Nguyen Van Linh',
      ward: 'Phu My',
      district: 'Thu Duc',
      province: 'Ho Chi Minh',
      note: 'Near the park',
      isDefault: false
    },
    description: 'Address object',
    title: 'AddressSchema'
  })

export const UpdateAddressSchema = AddressSchema.openapi('UpdateAddressSchema', {
  example: {
    name: 'Home',
    fullName: 'John Doe',
    phoneNumber: '0123456789',
    streetNumber: '123',
    streetName: 'Nguyen Van Linh',
    ward: 'Phu My',
    district: 'Thu Duc',
    province: 'Ho Chi Minh',
    note: 'Near the park',
    isDefault: false
  },
  description: 'Update address schema',
  title: 'UpdateAddressSchema'
})

export type AddressBodyType = z.infer<typeof AddressSchema>
