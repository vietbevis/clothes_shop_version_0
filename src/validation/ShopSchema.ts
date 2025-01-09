import { z } from 'zod'
import { AddressSchema } from '@/validation/AddressSchema'
import { ShopStatus } from '@/utils/enums'

export const CreateShopSchema = z
  .object({
    name: z.string().nonempty(),
    slogan: z.string().nonempty(),
    address: AddressSchema,
    description: z.string().nonempty(),
    logo: z.string().nonempty(),
    banner: z.string().default('')
  })
  .strip()
  .strip()
export type CreateShopType = z.infer<typeof CreateShopSchema>

export const UpdateShopSchema = z
  .object({
    name: z.string().nonempty().optional(),
    slogan: z.string().nonempty().optional(),
    description: z.string().nonempty().optional(),
    logo: z.string().nonempty().optional(),
    banner: z.string().nonempty().optional()
  })
  .strip()
  .strip()

export type UpdateShopType = z.infer<typeof UpdateShopSchema>

export const UpdateShopStatusSchema = z
  .object({
    status: z.enum([ShopStatus.OPEN, ShopStatus.CLOSED])
  })
  .strict()
  .strip()

export type UpdateShopStatusType = z.infer<typeof UpdateShopStatusSchema>
