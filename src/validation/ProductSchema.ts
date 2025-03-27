import { ProductStatus } from '@/utils/enums'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'
import { PaginationQuerySchema } from './CommonSchema'

extendZodWithOpenApi(z)

export const AttributeSchema = z
  .object({
    name: z.string().trim().nonempty(),
    value: z.string().trim().nonempty()
  })
  .strict()
  .strip()

export const OptionSchema = z
  .object({
    variantName: z.string().trim().nonempty(),
    value: z.string().trim().nonempty()
  })
  .strict()
  .strip()

export const VariantSchema = z
  .object({
    sku: z.string().trim().nonempty(),
    imageUrl: z.string().default(''),
    price: z.number(),
    oldPrice: z.number(),
    stock: z.number().int(),
    options: z.array(OptionSchema).min(1)
  })
  .strict()
  .strip()

export const ProductSchema = z
  .object({
    name: z.string().trim().nonempty(),
    description: z.string().default(''),
    categoryId: z.string().trim().nonempty(),
    attributes: z
      .array(AttributeSchema)
      .min(1)
      .refine((attrs) => new Set(attrs.map((a) => a.name)).size === attrs.length, {
        message: 'Duplicate attribute names found',
        path: ['attributes']
      }),
    variants: z.array(VariantSchema).min(1),
    images: z.array(z.string().trim().nonempty()).min(5),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.AVAILABLE)
  })
  .strict()
  .strip()
  .openapi('ProductSchema', {
    description: 'Product schema',
    title: 'Product',
    example: {
      name: 'Product name',
      description: 'Product description',
      categoryId: '123',
      attributes: [
        {
          name: 'Made in',
          value: 'Viet Nam'
        }
      ],
      variants: [
        {
          sku: '123',
          imageUrl: '01957fa49d7b74aa8ed07288a3b00214.webp',
          price: 100000,
          oldPrice: 150000,
          stock: 10,
          options: [
            {
              variantName: 'Size',
              value: 'S'
            }
          ]
        }
      ],
      images: ['01957fa49d7b74aa8ed07288a3b00214.webp'],
      status: ProductStatus.AVAILABLE
    }
  })

export const GetProductPaginationQuerySchema = z
  .object({
    ...PaginationQuerySchema.shape,
    name: z.string().optional(),
    shopSlug: z.string().optional(),
    categoryId: z.string().optional()
  })
  .strict()
  .strip()

export type GetProductPaginationQueryType = z.infer<typeof GetProductPaginationQuerySchema>
export type ProductSchemaType = z.infer<typeof ProductSchema>
