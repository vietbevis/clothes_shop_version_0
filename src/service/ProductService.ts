import { ProductSchemaType } from '@/validation/ProductSchema'
import { AppDataSource } from '@/config/database'
import AttributeValueRepository, { TAttributeValueRepository } from '@/repository/AttributeValueRepository'
import ProductAttributeRepository, { TProductAttributeRepository } from '@/repository/ProductAttributeRepository'
import VariantRepository, { TVariantRepository } from '@/repository/VariantRepository'
import VariantOptionRepository, { TVariantOptionRepository } from '@/repository/VariantOptionRepository'
import ProductVariantRepository, { TProductVariantRepository } from '@/repository/ProductVariantRepository'
import ProductRepository from '@/repository/ProductRepository'
import CategoryRepository from '@/repository/CategoryRepository'
import { BadRequestError, EntityError, UnauthorizedError, ValidationError } from '@/core/ErrorResponse'
import ImageRepository, { TImageRepository } from '@/repository/ImageRepository'
import ShopRepository from '@/repository/ShopRepository'
import {
  getLowestInStockOldPrice,
  getLowestInStockPrice,
  generateSlug,
  omitFields,
  serializeProduct,
  getGroupedVariantOptions
} from '@/utils/helper'
import { PaginationUtils } from '@/utils/PaginationUtilsV2'
import { Request } from 'express'
import { In, Like } from 'typeorm'
import { DecodedJwtToken } from './JwtService'
import AttributeRepository, { TAttributeRepository } from '@/repository/AttributeRepository'

class ProductService {
  async createProduct(body: ProductSchemaType, user: DecodedJwtToken) {
    const { attributes, variants, categoryId, images, ...rest } = body
    const imagesSet = new Set(images)

    return AppDataSource.manager.transaction(async (manager) => {
      const repositories = {
        attribute: manager.withRepository(AttributeRepository),
        attributeValue: manager.withRepository(AttributeValueRepository),
        productAttribute: manager.withRepository(ProductAttributeRepository),
        variant: manager.withRepository(VariantRepository),
        variantOption: manager.withRepository(VariantOptionRepository),
        productVariant: manager.withRepository(ProductVariantRepository),
        product: manager.withRepository(ProductRepository),
        category: manager.withRepository(CategoryRepository),
        image: manager.withRepository(ImageRepository),
        shop: manager.withRepository(ShopRepository)
      }

      const [shop, category] = await Promise.all([
        repositories.shop.findByOwner(user.payload.id),
        repositories.category.findById(categoryId)
      ])

      if (!shop) throw new BadRequestError('Shop not found')
      if (!category) {
        throw new ValidationError('Category not found', [new EntityError('categoryId', 'Category not found')])
      }

      const [savedAttributes, productVariants] = await Promise.all([
        this.checkAndCreateAttribute(
          attributes,
          repositories.attribute,
          repositories.attributeValue,
          repositories.productAttribute
        ),
        this.checkAndCreateVariant(
          variants,
          repositories.variant,
          repositories.variantOption,
          repositories.productVariant
        )
      ])

      const product = repositories.product.create({
        ...rest,
        category,
        shopId: shop.id,
        slug: generateSlug(rest.name),
        images: Array.from(imagesSet),
        attributes: savedAttributes,
        variants: productVariants
      })

      const savedProduct = await repositories.product.save(product)
      return serializeProduct(savedProduct)
    })
  }

  async updateProduct(id: string, body: ProductSchemaType, user: DecodedJwtToken) {
    return AppDataSource.manager.transaction(async (manager) => {
      const repositories = {
        product: manager.withRepository(ProductRepository),
        category: manager.withRepository(CategoryRepository),
        image: manager.withRepository(ImageRepository),
        productAttribute: manager.withRepository(ProductAttributeRepository),
        attribute: manager.withRepository(AttributeRepository),
        attributeValue: manager.withRepository(AttributeValueRepository),
        productVariant: manager.withRepository(ProductVariantRepository),
        variant: manager.withRepository(VariantRepository),
        variantOption: manager.withRepository(VariantOptionRepository)
      }

      const { attributes, variants, categoryId, images, ...rest } = body

      const product = await repositories.product.findById(id, {
        attributes: { attribute: true, value: true },
        variants: { options: { variant: true } },
        category: true,
        shop: true
      })

      if (!product) throw new BadRequestError('Product not found')
      if (product.shop.ownerId !== user.payload.id) {
        throw new UnauthorizedError('You are not authorized to update this product')
      }

      const parallelOperations = [] as Promise<any>[]

      if (categoryId && product.categoryId !== categoryId) {
        parallelOperations.push(
          repositories.category.findById(categoryId).then((category) => {
            if (!category) {
              throw new ValidationError('Category not found', [new EntityError('categoryId', 'Category not found')])
            }
            product.categoryId = categoryId
          })
        )
      }

      if (attributes && attributes.length > 0) {
        parallelOperations.push(
          this.checkAndCreateAttribute(
            attributes,
            repositories.attribute,
            repositories.attributeValue,
            repositories.productAttribute
          ).then((savedAttributes) => {
            product.attributes = savedAttributes
          })
        )
        parallelOperations.push(repositories.productAttribute.delete({ product: { id } }))
      }

      if (variants && variants.length > 0) {
        parallelOperations.push(
          this.checkAndCreateVariant(
            variants,
            repositories.variant,
            repositories.variantOption,
            repositories.productVariant
          ).then((productVariants) => {
            product.variants = productVariants
          })
        )
        parallelOperations.push(repositories.productVariant.delete({ product: { id } }))
      }

      if (images && images.length > 0) {
        const imagesSet = new Set(images)
        product.images = Array.from(imagesSet)
      }

      await Promise.all(parallelOperations)

      if (rest.name && rest.name !== product.name) {
        product.slug = generateSlug(rest.name)
      }
      repositories.product.merge(product, rest)

      // Save the updated product
      const updatedProduct = await repositories.product.save(product)
      return serializeProduct(updatedProduct)
    })
  }

  private async checkAndCreateAttribute(
    attributes: { value: string; name: string }[],
    attributeRepo: TAttributeRepository,
    attributeValueRepo: TAttributeValueRepository,
    productAttributeRepo: TProductAttributeRepository
  ) {
    if (!attributes?.length) return []

    // Attribute names duy nhất
    const attributeNames = [...new Set(attributes.map((attr) => attr.name))]

    // Tìm tất cả attribute đã tồn tại
    const existingAttributes = await attributeRepo.find({ where: { name: In(attributeNames) } })
    const attributeMap = new Map(existingAttributes.map((attr) => [attr.name, attr]))

    // Tìm các attribute chưa tồn tại
    const missingNames = attributeNames.filter((name) => !attributeMap.has(name))
    if (missingNames.length > 0) {
      const newAttributes = attributeRepo.create(missingNames.map((name) => ({ name })))
      const savedAttributes = await attributeRepo.save(newAttributes)
      savedAttributes.forEach((attr) => attributeMap.set(attr.name, attr))
    }

    // Tạo các attribute value mới
    const attributeValuePairs = attributes.map((attr) => ({
      attributeId: attributeMap.get(attr.name)!.id,
      value: attr.value
    }))

    // Tìm các attribute value đã tồn tại
    const existingValues = await attributeValueRepo.find({
      where: attributeValuePairs.map((pair) => ({
        value: pair.value,
        attribute: { id: pair.attributeId }
      })),
      relations: { attribute: true }
    })

    // Create efficient lookup map
    const valueMap = new Map(existingValues.map((av) => [`${av.attribute.id}-${av.value}`, av]))

    // Create missing attribute values in batch
    const missingValues = []
    for (const pair of attributeValuePairs) {
      const key = `${pair.attributeId}-${pair.value}`
      if (!valueMap.has(key)) {
        missingValues.push({
          value: pair.value,
          attribute: { id: pair.attributeId }
        })
      }
    }

    if (missingValues.length > 0) {
      const newValues = attributeValueRepo.create(missingValues)
      const savedValues = await attributeValueRepo.save(newValues)
      savedValues.forEach((av) => valueMap.set(`${av.attribute.id}-${av.value}`, av))
    }

    // Create product attributes (no save needed - will be saved with product)
    return attributes.map(({ name, value }) => {
      const attribute = attributeMap.get(name)
      const attributeValue = valueMap.get(`${attribute!.id}-${value}`)
      return productAttributeRepo.create({ attribute, value: attributeValue })
    })
  }

  private async checkAndCreateVariant(
    variants: { options: { imageUrl: string; value: string; variantName: string }[]; [key: string]: any }[],
    variantRepo: TVariantRepository,
    variantOptionRepo: TVariantOptionRepository,
    productVariantRepo: TProductVariantRepository
  ) {
    // Nhóm variant options dựa vào input
    const groupedVariants = getGroupedVariantOptions(variants)

    // Tìm tất cả các variant đã tồn tại trong database
    const variantFounded = await variantRepo.find({
      where: { name: In(groupedVariants.map((v) => v.name)) },
      relations: { options: true }
    })
    const variantMap = new Map(variantFounded.map((v) => [v.name, v]))

    // Tạo các variant mới nếu chưa tồn tại
    const missingVariants = groupedVariants.filter((v) => !variantMap.has(v.name))
    if (missingVariants.length > 0) {
      const newVariants = variantRepo.create(missingVariants.map((v) => ({ name: v.name })))
      const savedVariants = await variantRepo.save(newVariants)
      savedVariants.forEach((v) => variantMap.set(v.name, v))
    }

    // Xử lý các variant options
    await Promise.all(
      groupedVariants.map(async (group) => {
        const variantEntity = variantMap.get(group.name)!
        const existingOptions = variantEntity.options || []
        const existingOptionMap = new Map(existingOptions.map((opt) => [`${opt.value}-${opt.imageUrl}`, opt]))

        // Lọc các option chưa có
        const missingOptions = group.options.filter((opt) => !existingOptionMap.has(`${opt.value}-${opt.imageUrl}`))
        if (missingOptions.length > 0) {
          const newOptions = variantOptionRepo.create(
            missingOptions.map((opt) => ({
              value: opt.value,
              imageUrl: opt.imageUrl || '',
              variant: variantEntity
            }))
          )
          const savedOptions = await variantOptionRepo.save(newOptions)
          variantEntity.options = [...existingOptions, ...savedOptions]
        }
      })
    )

    // Tạo các ProductVariant từ variants input
    const productVariants = variants.map((variant) => {
      const productVariant = productVariantRepo.create({
        ...variant,
        options: variant.options.map((opt) => {
          const variantEntity = variantMap.get(opt.variantName)
          if (!variantEntity) {
            throw new BadRequestError(`Variant ${opt.variantName} not found`)
          }
          const optionEntity = variantEntity.options.find((o) => o.value === opt.value && o.imageUrl === opt.imageUrl)
          if (!optionEntity) {
            throw new BadRequestError(`Option ${opt.value} for variant ${opt.variantName} not found`)
          }
          return optionEntity
        })
      })
      return productVariant
    })

    return productVariants
  }

  async getProduct(slug: string) {
    const result = await ProductRepository.findBySlug(slug, {
      variants: { options: { variant: true } },
      attributes: { value: true, attribute: true },
      category: true
    })

    if (!result) throw new BadRequestError('Product not found')

    return serializeProduct(result)
  }

  async getProductByShopSlug(slug: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    const paginatedProducts = await PaginationUtils.paginate(
      ProductRepository,
      paginationOptions,
      {
        shop: slug ? { slug } : undefined,
        name: req.query?.name ? Like(`%${req.query.name}%`) : undefined,
        ...((req.query?.categoryId && { category: { id: req.query.categoryId } }) as any)
      },
      {
        variants: true,
        shop: true
      }
    )

    return omitFields(
      {
        ...paginatedProducts,
        items: paginatedProducts.items.map((item) => {
          return {
            ...item,
            price: getLowestInStockPrice(item),
            oldPrice: getLowestInStockOldPrice(item),
            stock: item.variants.reduce((acc, variant) => acc + variant.stock, 0),
            shopSlug: item.shop.slug
          }
        })
      },
      ['variants', 'shop']
    )
  }

  async getProducts(req: Request) {
    // if (!req?.user) throw new UnauthorizedError()
    // const shop = await ShopRepository.findByOwner(req.user.id)
    // if (!shop) throw new BadRequestError('Shop not found')
    const shopSlug = req.query.shopSlug as string
    return this.getProductByShopSlug(shopSlug, req)
  }
}

const productService = new ProductService()
export default productService
