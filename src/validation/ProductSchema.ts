import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { ProductStatus } from '@/utils/enums'

extendZodWithOpenApi(z)

export const AttributeSchema = z
  .object({
    name: z.string().nonempty(),
    value: z.string().nonempty()
  })
  .strict()
  .strip()
  .openapi({ description: 'Attribute schema', title: 'Attribute' })

export const OptionSchema = z
  .object({
    variantName: z.string().nonempty(),
    value: z.string().nonempty()
  })
  .strict()
  .strip()
  .openapi({ description: 'Option schema', title: 'Option' })

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
  .openapi({ description: 'Variant schema', title: 'Variant' })

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
  .openapi({ description: 'Product schema', title: 'Product' })

export type ProductSchemaType = z.infer<typeof ProductSchema>
