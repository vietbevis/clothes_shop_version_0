import z from 'zod'
import { BaseDTO, BaseEntityDTO, MetaPagination } from './BaseDTO'
import { CategoryDTO } from './CategoryDTO'

export const ProductDTO = z
  .object({
    ...BaseEntityDTO.shape,
    name: z.string(),
    slug: z.string(),
    shopSlug: z.string(),
    category: CategoryDTO.pick({ id: true, name: true, slug: true, imageUrl: true }),
    imageUrls: z.array(z.string()),
    description: z.string(),
    status: z.string(),
    attributes: z.record(z.any()),
    variants: z.array(
      z.object({
        sku: z.string(),
        imageUrl: z.string(),
        price: z.string().or(z.number()),
        oldPrice: z.string().or(z.number()),
        stock: z.string().or(z.number()),
        options: z.array(z.object({ variantName: z.string(), value: z.string() }))
      })
    ),
    groupedOptions: z.array(z.object({ name: z.string(), options: z.array(z.string()) }))
  })
  .strip()

export const ProductRes = z.object({
  ...BaseDTO.shape,
  data: ProductDTO
})

export const ProductOfList = z
  .object({
    ...BaseEntityDTO.shape,
    name: z.string(),
    slug: z.string(),
    images: z.array(z.string()),
    description: z.string(),
    categoryId: z.string(),
    status: z.string(),
    shopSlug: z.string(),
    price: z.string(),
    oldPrice: z.string(),
    stock: z.number()
  })
  .strip()

export const PaginateProductDTO = z.object({
  items: z.array(ProductOfList),
  meta: MetaPagination
})

export const ListProductRes = z.object({
  ...BaseDTO.shape,
  data: PaginateProductDTO
})
