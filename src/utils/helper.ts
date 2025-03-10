import { hash } from 'bcryptjs'
import { cloneDeep, create, isArray, isObject, map, omit, reduce } from 'lodash'
import { type ObjectLiteral } from 'typeorm'
import { v7 } from 'uuid'
import path from 'path'
import fs from 'fs'
import slugify from 'slugify'
import { Product } from '@/model/Product'
import { randomInt } from 'crypto'

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}

export const UPLOAD_TEMP_DIR = 'uploads'
export const UPLOAD_TEMP_DIR_OPTIMIZE = 'uploads/optimized'

export const initFolder = () => {
  const uploadFolderPath = path.resolve(UPLOAD_TEMP_DIR)
  const optimizeFolderPath = path.resolve(UPLOAD_TEMP_DIR_OPTIMIZE)
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, { recursive: true })
    console.log('Created: ' + uploadFolderPath)
  }
  if (!fs.existsSync(optimizeFolderPath)) {
    fs.mkdirSync(optimizeFolderPath, { recursive: true })
    console.log('Created: ' + optimizeFolderPath)
  }
}

export const generateSlug = (str: string): string => {
  const newStr = slugify(str, {
    lower: true,
    strict: true,
    locale: 'vi'
  })
  return newStr + '-' + v7().replace(/-/g, '').slice(9)
}

export const generateUsername = (fullName: string) => {
  const arr = fullName.trim().split(' ')
  let newName = ''
  if (arr.length >= 2) {
    newName = arr[0].trim() + ' ' + arr[arr.length - 1].trim()
  } else {
    newName = arr[0].trim()
  }
  newName = newName.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
  return newName + '_' + v7().replace(/-/g, '').slice(9)
}

export const omitFields = <T extends ObjectLiteral>(data: T, fields: string[] = []) => {
  const deepOmit = (obj: any): any => {
    if (isArray(obj)) {
      return map(obj, deepOmit)
    } else if (isObject(obj)) {
      const omittedObject = omit(obj, fields)
      return reduce(
        omittedObject,
        (acc, value: any, key) => {
          acc[key] = isObject(value) ? deepOmit(value) : value
          key === 'createdAt' && value instanceof Date && (acc[key] = value?.toISOString())
          key === 'updatedAt' && value instanceof Date && (acc[key] = value?.toISOString())
          return acc
        },
        {} as Record<string, any>
      )
    }
    return obj
  }

  return deepOmit(cloneDeep(data))
}

const saltRounds = 10
export const hashPassword = async (password: string) => hash(password, saltRounds)

export function serializeProduct(product: Product) {
  // Serialize attributes thành object key-value
  const attributes = product.attributes.reduce((acc: any, attr) => {
    acc[attr.attribute.name] = attr.value.value
    return acc
  }, {})

  // Serialize variants
  const variants = product.variants.map((variant) => {
    // Serialize options, gắn imageUrl riêng cho mỗi option
    const options = variant.options.map((option) => ({
      variantName: option.variant.name,
      value: option.value
    }))

    return {
      sku: variant.sku,
      imageUrl: variant.imageUrl,
      price: variant.price,
      oldPrice: variant.oldPrice,
      stock: variant.stock,
      options
    }
  })

  // Trả về sản phẩm đã serialize
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shopSlug: product.shopSlug,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
      imageUrl: product.category?.imageUrl || ''
    },
    imageUrls: product.images,
    description: product?.description || '',
    status: product.status,
    attributes,
    variants,
    groupedOptions: getGroupedVariantOptionsRes(variants),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  }
}

export const getGroupedVariantOptionsRes = (
  variants: {
    sku: string
    imageUrl: string
    price: number
    oldPrice: number
    stock: number
    options: {
      variantName: string
      value: string
    }[]
  }[]
) => {
  // Create a Map for better performance with object keys
  const variantGroups = new Map<string, Set<string>>()

  // Process each variant's options
  for (const variant of variants) {
    for (const option of variant.options) {
      const variantName = option.variantName

      // Get or create Set for this variant type
      if (!variantGroups.has(variantName)) {
        variantGroups.set(variantName, new Set())
      }

      // Add the option value
      const variant = variantGroups.get(variantName)!
      const existingOption = Array.from(variant).find((o) => o === option.value)
      if (!existingOption) {
        variant.add(option.value)
      }
    }
  }

  // Convert to final array format
  return Array.from(variantGroups.entries()).map(([name, options]) => ({
    name,
    options: Array.from(options)
  }))
}

export const getGroupedVariantOptions = (
  variants: { options: { value: string; variantName: string }[]; [key: string]: any }[]
) => {
  // Create a Map for better performance with object keys
  const variantGroups = new Map<string, Set<{ value: string; variantName: string }>>()

  // Process each variant's options
  for (const variant of variants) {
    for (const option of variant.options) {
      const variantName = option.variantName

      // Get or create Set for this variant type
      if (!variantGroups.has(variantName)) {
        variantGroups.set(variantName, new Set())
      }

      // Add the option value
      const variant = variantGroups.get(variantName)!
      const existingOption = Array.from(variant).find((o) => o.value === option.value)
      if (!existingOption) {
        variant.add(option)
      }
    }
  }

  // Convert to final array format
  return Array.from(variantGroups.entries()).map(([name, options]) => ({
    name,
    options: Array.from(options)
  }))
}

export const getLowestInStockPrice = (product: Product) => {
  let lowestPrice = Infinity

  for (const variant of product.variants) {
    if (variant.stock > 0 && variant.price < lowestPrice) {
      lowestPrice = variant.price
    }
  }

  return lowestPrice === Infinity ? 0 : parseFloat(lowestPrice + '').toFixed(2)
}

export const getLowestInStockOldPrice = (product: Product) => {
  let lowestPrice = Infinity

  for (const variant of product.variants) {
    if (variant.stock > 0 && variant.oldPrice < lowestPrice) {
      lowestPrice = variant.oldPrice
    }
  }

  return lowestPrice === Infinity ? 0 : parseFloat(lowestPrice + '').toFixed(2)
}

export const getTotalStock = (product: Product) => {
  let totalStock = 0

  for (const variant of product.variants) {
    totalStock += variant.stock
  }

  return totalStock
}

export const generateOTP = () => {
  return String(randomInt(100000, 1000000))
}
