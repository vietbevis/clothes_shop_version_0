import z from 'zod'
import { BaseDTO, MetaPagination } from './BaseDTO'

export const ImageDTO = z
  .object({
    fileName: z.string().openapi({ example: '01956421bbbb742d94e429e1b8543345.webp' }),
    width: z.number().openapi({ example: 1920 }),
    height: z.number().openapi({ example: 1080 }),
    createdAt: z.date().openapi({ example: '2021-09-01T07:00:00.000Z' }),
    updatedAt: z.date().openapi({ example: '2021-09-01T07:00:00.000Z' })
  })
  .strip()

export const ListImageResData = z.array(ImageDTO)

export const PaginateImageDTO = z
  .object({
    items: z.array(ImageDTO),
    meta: MetaPagination
  })
  .strip()

export const ListImageRes = z.object({
  ...BaseDTO.shape,
  data: PaginateImageDTO
})

export const ImageRes = z.object({
  ...BaseDTO.shape,
  data: ImageDTO
})

export const ImageUploadRes = z.object({
  ...BaseDTO.shape,
  data: z.array(ImageDTO)
})
