import { ProductSchemaType } from '@/validation/ProductSchema'
import { AppDataSource } from '@/config/database'
import { BadRequestError, EntityError, UnauthorizedError, ValidationError } from '@/core/ErrorResponse'
import {
  getLowestInStockOldPrice,
  getLowestInStockPrice,
  generateSlug,
  omitFields,
  serializeProduct,
  getGroupedVariantOptions
} from '@/utils/helper'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { Request } from 'express'
import { In, Like } from 'typeorm'
import { DecodedJwtToken } from './JwtService'
import { Injectable } from '@/decorators/inject'
import { ProductRepository } from '@/repository/ProductRepository'
import { CategoryRepository } from '@/repository/CategoryRepository'
import { ImageRepository } from '@/repository/ImageRepository'
import { ShopRepository } from '@/repository/ShopRepository'
import { AttributeRepository } from '@/repository/AttributeRepository'
import { AttributeValueRepository } from '@/repository/AttributeValueRepository'
import { ProductAttributeRepository } from '@/repository/ProductAttributeRepository'
import { VariantRepository } from '@/repository/VariantRepository'
import { VariantOptionRepository } from '@/repository/VariantOptionRepository'
import { ProductVariantRepository } from '@/repository/ProductVariantRepository'
import { ProductVariant } from '@/model/ProductVariant'
import { VariantOption } from '@/model/VariantOption'
import { PaginateProductDTO, ProductDTO } from '@/dtos/ProductDTO'

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly imageRepository: ImageRepository,
    private readonly shopRepository: ShopRepository,
    private readonly attributeRepository: AttributeRepository,
    private readonly attributeValueRepository: AttributeValueRepository,
    private readonly productAttributeRepository: ProductAttributeRepository,
    private readonly variantRepository: VariantRepository,
    private readonly variantOptionRepository: VariantOptionRepository,
    private readonly productVariantRepository: ProductVariantRepository
  ) {}

  async createProduct(body: ProductSchemaType, user: DecodedJwtToken) {
    const { attributes, variants, categoryId, images, ...rest } = body
    const imagesSet = new Set(images)

    return AppDataSource.manager.transaction(async (manager) => {
      const repositories = {
        attribute: manager.withRepository(this.attributeRepository),
        attributeValue: manager.withRepository(this.attributeValueRepository),
        productAttribute: manager.withRepository(this.productAttributeRepository),
        variant: manager.withRepository(this.variantRepository),
        variantOption: manager.withRepository(this.variantOptionRepository),
        productVariant: manager.withRepository(this.productVariantRepository),
        product: manager.withRepository(this.productRepository),
        category: manager.withRepository(this.categoryRepository),
        image: manager.withRepository(this.imageRepository),
        shop: manager.withRepository(this.shopRepository)
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
        shopSlug: shop.slug,
        slug: generateSlug(rest.name),
        images: Array.from(imagesSet),
        attributes: savedAttributes,
        variants: productVariants
      })

      const savedProduct = await repositories.product.save(product)
      return ProductDTO.parse(serializeProduct(savedProduct))
    })
  }

  async updateProduct(id: string, body: ProductSchemaType, user: DecodedJwtToken) {
    return AppDataSource.manager.transaction(async (manager) => {
      const repositories = {
        product: manager.withRepository(this.productRepository),
        category: manager.withRepository(this.categoryRepository),
        image: manager.withRepository(this.imageRepository),
        productAttribute: manager.withRepository(this.productAttributeRepository),
        attribute: manager.withRepository(this.attributeRepository),
        attributeValue: manager.withRepository(this.attributeValueRepository),
        productVariant: manager.withRepository(this.productVariantRepository),
        variant: manager.withRepository(this.variantRepository),
        variantOption: manager.withRepository(this.variantOptionRepository)
      }

      const { attributes, variants, categoryId, images, ...rest } = body

      const product = await repositories.product.findById(id, {
        attributes: { attribute: true, value: true },
        variants: { options: { variant: true } },
        category: true,
        shop: { owner: true }
      })

      if (!product) throw new BadRequestError('Product not found')
      if (product.shop.owner.id !== user.payload.id) {
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
        // Lấy existingVariants từ sản phẩm hiện tại
        const existingVariants = product.variants || []
        parallelOperations.push(
          this.checkAndCreateVariant(
            variants,
            repositories.variant,
            repositories.variantOption,
            repositories.productVariant,
            existingVariants
          ).then((productVariants) => {
            product.variants = productVariants
          })
        )
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
      return ProductDTO.parse(serializeProduct(updatedProduct))
    })
  }

  private async checkAndCreateAttribute(
    attributes: { value: string; name: string }[],
    attributeRepo: AttributeRepository,
    attributeValueRepo: AttributeValueRepository,
    productAttributeRepo: ProductAttributeRepository
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
    variants: { options: { value: string; variantName: string }[]; [key: string]: any }[],
    variantRepo: VariantRepository,
    variantOptionRepo: VariantOptionRepository,
    productVariantRepo: ProductVariantRepository,
    existingVariants: ProductVariant[] = []
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
    const missOptions: VariantOption[] = []
    await Promise.all(
      groupedVariants.map(async (group) => {
        const variantEntity = variantMap.get(group.name)!
        const existingOptions = variantEntity.options || []
        const existingOptionMap = new Map(existingOptions.map((opt) => [`${opt.value}`, opt]))

        // Lọc các option chưa có
        const missingOptions = group.options.filter((opt) => !existingOptionMap.has(`${opt.value}`))
        if (missingOptions.length > 0) {
          const newOptions = variantOptionRepo.create(
            missingOptions.map((opt) => ({
              value: opt.value,
              variant: variantEntity
            }))
          )
          missOptions.push(...newOptions)
          variantEntity.options = [...existingOptions, ...newOptions]
        }
      })
    )

    await variantOptionRepo.save(missOptions)

    // Tạo map cho các ProductVariant hiện có
    const existingVariantMap = new Map<string, ProductVariant>()
    existingVariants.forEach((variant) => {
      const key = variant.options
        .map((opt) => `${opt.variant.name}:${opt.value}`)
        .sort()
        .join('|')
      existingVariantMap.set(key, variant)
    })

    // Danh sách các ProductVariant sẽ được giữ hoặc cập nhật
    const productVariants: ProductVariant[] = []

    for (const variant of variants) {
      // Tạo key từ input
      const inputKey = variant.options
        .map((opt) => `${opt.variantName}:${opt.value}`)
        .sort()
        .join('|')

      // Tìm các VariantOption từ input
      const options = variant.options.map((opt) => {
        const variantEntity = variantMap.get(opt.variantName)
        if (!variantEntity) {
          throw new BadRequestError(`Variant ${opt.variantName} not found`)
        }
        const optionEntity = variantEntity.options.find((o) => o.value === opt.value)
        if (!optionEntity) {
          throw new BadRequestError(`Option ${opt.value} for variant ${opt.variantName} not found`)
        }
        return optionEntity
      })

      // Kiểm tra xem ProductVariant đã tồn tại chưa
      const existingVariant = existingVariantMap.get(inputKey)
      if (existingVariant) {
        // Cập nhật thông tin của ProductVariant hiện có
        existingVariant.imageUrl = variant.imageUrl
        existingVariant.price = variant.price
        existingVariant.oldPrice = variant.oldPrice
        existingVariant.stock = variant.stock
        existingVariant.sku = variant.sku
        productVariants.push(existingVariant)
      } else {
        // Tạo mới ProductVariant
        const newVariant = productVariantRepo.create({
          ...variant,
          options
        })
        productVariants.push(newVariant)
      }
    }

    // Xác định các ProductVariant cần xóa
    const variantsToDelete = existingVariants.filter((variant) => !productVariants.some((v) => v.id === variant.id))

    // Xóa các ProductVariant không còn trong input
    if (variantsToDelete.length > 0) {
      await productVariantRepo.remove(variantsToDelete)
    }

    return productVariants
  }

  async getProductBySlug(slug: string) {
    const result = await this.productRepository.findBySlug(slug, {
      variants: { options: { variant: true } },
      attributes: { value: true, attribute: true },
      category: true
    })

    if (!result) throw new BadRequestError('Product not found')

    return ProductDTO.parse(serializeProduct(result))
  }

  async getProductsByShopSlug(slug: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    const paginatedProducts = await PaginationUtils.paginate(
      this.productRepository,
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

    return PaginateProductDTO.parse({
      ...paginatedProducts,
      items: paginatedProducts.items.map((item) => {
        return {
          ...item,
          price: getLowestInStockPrice(item),
          oldPrice: getLowestInStockOldPrice(item),
          stock: item.variants.reduce((acc, variant) => acc + variant.stock, 0)
        }
      })
    })
  }

  async getProducts(req: Request) {
    const shopSlug = req.query.shopSlug as string
    return this.getProductsByShopSlug(shopSlug, req)
  }
}
