import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { AddressSchema } from '@/validation/AddressSchema'
import { ShopStatus } from '@/utils/enums'
import z from 'zod'

extendZodWithOpenApi(z)

export const CreateShopSchema = z
  .object({
    name: z.string().trim().nonempty(),
    slogan: z.string().trim().nonempty(),
    address: AddressSchema,
    description: z.string().trim().nonempty(),
    logoUrl: z.string().trim().nonempty(),
    bannerUrl: z.string().trim().nonempty()
  })
  .strip()
  .strip()
  .openapi('CreateShopSchema', {
    description: 'Create shop schema',
    title: 'CreateShop',
    example: {
      name: 'Shop name',
      slogan: 'Shop slogan',
      address: {
        name: 'Home',
        fullName: 'John Doe',
        phoneNumber: '0123456789',
        streetNumber: '123',
        streetName: 'Nguyen Van Linh',
        ward: 'Phu My',
        district: 'Thu Duc',
        province: 'Ho Chi Minh',
        note: 'Near the park'
      },
      description: 'Shop description',
      logoUrl: '01957fa49d7b74aa8ed07288a3b00214.webp',
      bannerUrl: '01957fa49d7b74aa8ed07288a3b00214.webp'
    }
  })

export const UpdateShopSchema = z
  .object({
    name: z.string().trim().nonempty(),
    slogan: z.string().trim().nonempty(),
    description: z.string().trim().nonempty(),
    logoUrl: z.string().trim().nonempty(),
    bannerUrl: z.string().trim().nonempty(),
    address: AddressSchema,
    status: z.enum([ShopStatus.OPEN, ShopStatus.CLOSED])
  })
  .strip()
  .strip()
  .openapi('UpdateShopSchema', {
    description: 'Update shop schema',
    title: 'UpdateShop',
    example: {
      name: 'Shop name',
      slogan: 'Shop slogan',
      address: {
        name: 'Home',
        fullName: 'John Doe',
        phoneNumber: '0123456789',
        streetNumber: '123',
        streetName: 'Nguyen Van Linh',
        ward: 'Phu My',
        district: 'Thu Duc',
        province: 'Ho Chi Minh',
        note: 'Near the park'
      },
      description: 'Shop description',
      logoUrl: '01957fa49d7b74aa8ed07288a3b00214.webp',
      bannerUrl: '01957fa49d7b74aa8ed07288a3b00214.webp',
      status: ShopStatus.OPEN
    }
  })

export type CreateShopType = z.infer<typeof CreateShopSchema>
export type UpdateShopType = z.infer<typeof UpdateShopSchema>
