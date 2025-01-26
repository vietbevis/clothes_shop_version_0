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
import { User } from '@/model/User'
import ShopRepository from '@/repository/ShopRepository'
import { getLowestInStockPrice, getSlug, omitFields, serializeProduct } from '@/utils/helper'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { Request } from 'express'
import { Product } from '@/model/Product'
import { Like } from 'typeorm'

class ProductService {
  async createProduct(body: ProductSchemaType, user: User | null) {
    if (!user) throw new UnauthorizedError()

    // Create a new product
    const { attributes, variants, categoryId, thumbnail, images, ...rest } = body
    const imagesSet = new Set(images)

    return AppDataSource.manager.transaction(async (manager) => {
      const attributeRepo = manager.withRepository(AttributeValueRepository)
      const productAttributeRepo = manager.withRepository(ProductAttributeRepository)
      const variantRepo = manager.withRepository(VariantRepository)
      const variantOptionRepo = manager.withRepository(VariantOptionRepository)
      const productVariantRepo = manager.withRepository(ProductVariantRepository)
      const productRepo = manager.withRepository(ProductRepository)
      const categoryRepo = manager.withRepository(CategoryRepository)
      const imageRepo = manager.withRepository(ImageRepository)
      const shopRepo = manager.withRepository(ShopRepository)

      // Check shop exists
      const shop = await shopRepo.findByOwner(user.id)
      if (!shop) throw new BadRequestError('Shop not found')

      // Check category exists
      const category = await categoryRepo.findById(categoryId)
      if (!category) {
        throw new ValidationError('Category not found', [new EntityError('categoryId', 'Category not found')])
      }

      // Check thumbnail
      const thumbnailImage = await imageRepo.findByFileName(thumbnail)
      if (!thumbnailImage) {
        throw new ValidationError('Image not found', [new EntityError('thumbnail', 'Image not found')])
      }

      // Check images
      const otherImages = await imageRepo.findByFilenames([...imagesSet])
      if (imagesSet.size !== otherImages.length) {
        throw new ValidationError('Image not found', [new EntityError('images', 'Image not found')])
      }

      // Create product
      const product = productRepo.create({
        ...rest,
        category,
        shop,
        slug: getSlug(rest.name),
        thumbnail: thumbnailImage,
        images: otherImages
      })
      const savedProduct = await productRepo.save(product)

      // Check attributes
      const savedAttributes = await this.checkAndCreateAttribute(
        attributes,
        savedProduct,
        attributeRepo,
        productAttributeRepo
      )

      // Check variants
      const productVariants = await this.checkAndCreateVariant(
        variants,
        savedProduct,
        variantRepo,
        variantOptionRepo,
        productVariantRepo,
        imageRepo
      )

      savedProduct.attributes = savedAttributes
      savedProduct.variants = productVariants

      return serializeProduct(savedProduct)
    })
  }

  async updateProduct(slug: string, body: ProductSchemaType, user: User | null) {}

  async getProduct(slug: string) {
    const result = await ProductRepository.findBySlug(slug, {
      variants: { options: { image: true, variant: true } },
      attributes: { value: true },
      images: true,
      thumbnail: true,
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
        shop: { slug },
        name: req.query.name ? Like(`%${req.query.name}%`) : undefined
      },
      {
        variants: true,
        thumbnail: true
      }
    )

    return omitFields(
      {
        ...paginatedProducts,
        items: paginatedProducts.items.map((item) => {
          return {
            ...item,
            price: getLowestInStockPrice(item)
          }
        })
      },
      ['variants']
    )
  }

  async getProducts(req: Request) {
    if (!req?.user) throw new UnauthorizedError()
    const shop = await ShopRepository.findByOwner(req.user.id)
    if (!shop) throw new BadRequestError('Shop not found')
    return this.getProductByShopSlug(shop.slug, req)
  }

  private async checkAndCreateAttribute(
    attributes: { value: string; name: string }[],
    savedProduct: Product,
    attributeRepo: TAttributeValueRepository,
    productAttributeRepo: TProductAttributeRepository
  ) {
    return Promise.all(
      attributes.map(async ({ name, value }) => {
        let attribute = await attributeRepo.findByValue(value)
        if (!attribute) {
          // Create new attribute if not exists
          attribute = attributeRepo.create({ value })
          await attributeRepo.save(attribute)
        }

        const productAttribute = productAttributeRepo.create({
          name,
          product: savedProduct,
          value: attribute
        })
        return productAttributeRepo.save(productAttribute)
      })
    )
  }

  private async checkAndCreateVariant(
    variants: { options: { imageFilename: string; value: string; variantName: string }[]; [key: string]: any }[],
    savedProduct: Product,
    variantRepo: TVariantRepository,
    variantOptionRepo: TVariantOptionRepository,
    productVariantRepo: TProductVariantRepository,
    imageRepo: TImageRepository
  ) {
    return Promise.all(
      variants.map(async ({ options, ...restVariants }) => {
        const productVariant = productVariantRepo.create({
          ...restVariants,
          product: savedProduct
        })
        const variantOptions = await Promise.all(
          options.map(async ({ imageFilename, value, variantName }) => {
            let variant = await variantRepo.findByName(variantName)
            if (!variant) {
              variant = variantRepo.create({ name: variantName })
              await variantRepo.save(variant)
            }

            let variantOption = await variantOptionRepo.findByValueAndVariant(value, variant.id)
            if (!variantOption) {
              variantOption = variantOptionRepo.create({
                value,
                variant
              })

              if (imageFilename) {
                const optionImage = await imageRepo.findByFileName(imageFilename)
                if (!optionImage) {
                  throw new ValidationError('Image not found', [
                    new EntityError('variants.options.imageFilename', 'Image not found')
                  ])
                }
                variantOption.image = optionImage
              }

              await variantOptionRepo.save(variantOption)
            }

            return variantOption
          })
        )

        productVariant.options = variantOptions
        return productVariantRepo.save(productVariant)
      })
    )
  }
}

const productService = new ProductService()
export default productService
