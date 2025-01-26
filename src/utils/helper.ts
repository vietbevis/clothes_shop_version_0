import { hash } from 'bcryptjs'
import { cloneDeep, isArray, isObject, map, omit, reduce } from 'lodash'
import { type ObjectLiteral } from 'typeorm'
import { v7 } from 'uuid'
import path from 'path'
import fs from 'fs'
import slugify from 'slugify'
import { Product } from '@/model/Product'

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

export const getSlug = (str: string): string => {
  const newStr = slugify(str, {
    lower: true,
    strict: true,
    locale: 'vi'
  })
  return newStr + '-' + v7().replace(/-/g, '').slice(9)
}

export const getUsername = (fullName: string) => {
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
  const omitFieldsDefault = [
    'createdAt',
    'updatedAt',
    'password',
    'providerId',
    'roles',
    'privateKey',
    'publicKey',
    'type',
    'isPublic',
    ...fields
  ]

  const deepOmit = (obj: any): any => {
    if (isArray(obj)) {
      return map(obj, deepOmit)
    } else if (isObject(obj)) {
      const omittedObject = omit(obj, omitFieldsDefault)
      return reduce(
        omittedObject,
        (acc, value, key) => {
          acc[key] = isObject(value) ? deepOmit(value) : value
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
  const transformedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: getLowestInStockPrice(product),
    thumbnail: product.thumbnail,
    images: product.images,
    category: product.category,
    status: product.status,
    attributes: product.attributes.map((attr) => ({
      name: attr.name,
      value: attr.value.value
    })),
    variants: product.variants.map((variant) => {
      return {
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        oldPrice: variant.oldPrice,
        stock: variant.stock,
        options: variant.options.map((option) => ({
          variantName: option.variant.name,
          value: option.value,
          imageFilename: option.image
        }))
      }
    }),
    variantGroups: getGroupedVariantOptions(product)
  }

  return omitFields(transformedProduct)
}

const getGroupedVariantOptions = (product: Product) => {
  // Create a Map for better performance with object keys
  const variantGroups = new Map<string, Set<string>>()

  // Process each variant's options
  for (const variant of product.variants) {
    for (const option of variant.options) {
      const variantName = option.variant.name

      // Get or create Set for this variant type
      if (!variantGroups.has(variantName)) {
        variantGroups.set(variantName, new Set())
      }

      // Add the option value
      variantGroups.get(variantName)!.add(option.value)
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
