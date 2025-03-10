import z from 'zod'
import { BaseDTO, BaseEntityDTO, MetaPagination } from './BaseDTO'

export const CategoryDTO = z
  .object({
    ...BaseEntityDTO.shape,
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    level: z.number(),
    imageUrl: z.string().nullable()
  })
  .strip()

export const PaginateCategoryDTO = z
  .object({
    items: z.array(CategoryDTO),
    meta: MetaPagination
  })
  .strip()

export const ListCategoryRes = z
  .object({
    ...BaseDTO.shape,
    data: PaginateCategoryDTO
  })
  .openapi('ListCategoryRes')

export const CategoryRes = z
  .object({
    ...BaseDTO.shape,
    data: CategoryDTO
  })
  .openapi('CategoryRes')
