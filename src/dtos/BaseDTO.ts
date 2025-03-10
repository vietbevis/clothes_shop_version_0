import z from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const BaseDTO = z
  .object({
    code: z.number().openapi({ example: 200 }),
    status: z.string().openapi({ example: 'success' }),
    message: z.string().openapi({ example: 'Success' }),
    timestamp: z.date().openapi({ example: '2021-09-01T07:00:00.000Z' })
  })
  .strip()

export const MetaPagination = z
  .object({
    currentPage: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 24 }),
    totalItems: z.number().openapi({ example: 100 }),
    totalPages: z.number().openapi({ example: 5 }),
    hasNextPage: z.boolean().openapi({ example: true }),
    hasPreviousPage: z.boolean().openapi({ example: false }),
    sortBy: z.array(z.string()).openapi({ example: ['createdAt'] }),
    sortDirection: z.array(z.string()).openapi({ example: ['DESC'] })
  })
  .strip()

export const BaseEntityDTO = z.object({
  id: z.string().openapi({ example: '01956b20-aefb-72a9-b96a-07feb43c9b5d' }),
  createdAt: z.date().openapi({ example: '2021-09-01T07:00:00.000Z' }),
  updatedAt: z.date().openapi({ example: '2021-09-01T07:00:00.000Z' })
})
