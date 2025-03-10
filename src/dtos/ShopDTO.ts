import z from 'zod'
import { BaseDTO, BaseEntityDTO, MetaPagination } from './BaseDTO'
import { AddressDTO } from './AddressDTO'

export const ShopDTO = z
  .object({
    ...BaseEntityDTO.shape,
    name: z.string(),
    slogan: z.string(),
    slug: z.string(),
    address: AddressDTO.omit({ isDefault: true }),
    description: z.string(),
    status: z.string(),
    logoUrl: z.string(),
    bannerUrl: z.string()
  })
  .strip()

export const ShopRes = z.object({
  ...BaseDTO.shape,
  data: ShopDTO
})

export const ShopOfListRes = z
  .object({
    ...BaseEntityDTO.shape,
    name: z.string(),
    slogan: z.string(),
    slug: z.string(),
    description: z.string(),
    status: z.string(),
    logoUrl: z.string(),
    bannerUrl: z.string()
  })
  .strip()

export const ListShopData = z.array(ShopOfListRes)

export const PaginateShopDTO = z.object({
  items: ListShopData,
  meta: MetaPagination
})

export const ListShopRes = z.object({
  ...BaseDTO.shape,
  data: PaginateShopDTO
})
