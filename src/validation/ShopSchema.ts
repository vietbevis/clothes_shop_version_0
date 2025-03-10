import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { AddressSchema } from '@/validation/AddressSchema'
import { ShopStatus } from '@/utils/enums'

extendZodWithOpenApi(z)

export const CreateShopSchema = z
  .object({
    name: z.string().nonempty(),
    slogan: z.string().nonempty(),
    address: AddressSchema,
    description: z.string().nonempty(),
    logoUrl: z.string().nonempty(),
    bannerUrl: z.string().nonempty()
  })
  .strip()
  .strip()
  .openapi({ description: 'Create shop schema', title: 'CreateShop' })

export const UpdateShopSchema = z
  .object({
    name: z.string().nonempty(),
    slogan: z.string().nonempty(),
    description: z.string().nonempty(),
    logoUrl: z.string().nonempty(),
    bannerUrl: z.string().nonempty(),
    address: AddressSchema,
    status: z.enum([ShopStatus.OPEN, ShopStatus.CLOSED])
  })
  .strip()
  .strip()
  .openapi({ description: 'Update shop schema', title: 'UpdateShop' })

export type CreateShopType = z.infer<typeof CreateShopSchema>
export type UpdateShopType = z.infer<typeof UpdateShopSchema>
