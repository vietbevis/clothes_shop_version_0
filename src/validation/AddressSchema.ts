import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

export const AddressSchema = z
  .object({
    streetNumber: z.string({ message: 'Street number can not be blank' }),
    streetName: z.string({ message: 'Street name can not be blank' }),
    ward: z.string({ message: 'Ward can not be blank' }).min(3, { message: 'Ward must be at least 3 characters.' }),
    district: z
      .string({ message: 'District can not be blank' })
      .min(3, { message: 'District must be at least 3 characters.' }),
    province: z
      .string({ message: 'Province can not be blank' })
      .min(3, { message: 'Province must be at least 3 characters.' }),
    isDefault: z.boolean().default(false),
    note: z.string().default('')
  })
  .strict()
  .strip()
  .openapi('AddressSchema', {
    example: {
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

export const UpdateAddressSchema = AddressSchema.omit({ isDefault: true }).openapi('UpdateAddressSchema', {
  example: {
    streetNumber: '123',
    streetName: 'Nguyen Van Linh',
    ward: 'Phu My',
    district: 'Thu Duc',
    province: 'Ho Chi Minh',
    note: 'Near the park'
  },
  description: 'Update address schema',
  title: 'UpdateAddressSchema'
})

export type AddressBodyType = z.infer<typeof AddressSchema>
