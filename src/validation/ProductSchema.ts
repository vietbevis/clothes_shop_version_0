import { z } from 'zod'
import { ProductStatus } from '@/utils/enums'

export const AttributeSchema = z
  .object({
    name: z.string().nonempty(),
    value: z.string().nonempty()
  })
  .strict()
  .strip()

export const OptionSchema = z
  .object({
    variantName: z.string().nonempty(),
    value: z.string().nonempty()
  })
  .strict()
  .strip()

export const VariantSchema = z
  .object({
    sku: z.string().nonempty(),
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
    name: z.string().nonempty(),
    description: z.string().default(''),
    categoryId: z.string().nonempty(),
    attributes: z
      .array(AttributeSchema)
      .min(1)
      .refine((attrs) => new Set(attrs.map((a) => a.name)).size === attrs.length, {
        message: 'Duplicate attribute names found',
        path: ['attributes']
      }),
    variants: z.array(VariantSchema).min(1),
    images: z.array(z.string().nonempty()).min(5),
    status: z.nativeEnum(ProductStatus).default(ProductStatus.AVAILABLE)
  })
  .strict()
  .strip()

export type ProductSchemaType = z.infer<typeof ProductSchema>
