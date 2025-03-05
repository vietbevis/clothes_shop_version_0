<!-- Product.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { Category } from '@/model/Category'
import { ProductAttribute } from '@/model/ProductAttribute'
import { Comment } from '@/model/Comment'
import { Review } from '@/model/Review'
import { Shop } from '@/model/Shop'
import { Image } from '@/model/Image'
import { ProductStatus } from '@/utils/enums'
import { ProductVariant } from '@/model/ProductVariant'

@Entity('tbl_product')
export class Product extends AbstractModel {
  @Column({ nullable: false })
  name!: string

  @Column({ nullable: false, unique: true })
  slug!: string

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl!: string

  @ManyToOne(() => Image, { eager: true, nullable: false })
  @JoinColumn({ name: 'thumbnail_url' })
  thumbnail!: Image

  @RelationId((product: Product) => product.images)
  imageUrls!: string[]

  @ManyToMany(() => Image)
  @JoinTable({
    name: 'tbl_product_image',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'image_id' }
  })
  images!: Image[]

  @Column({ type: 'text', nullable: false })
  description!: string

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.AVAILABLE })
  status!: ProductStatus

  @Column({ nullable: true, name: 'shop_id' })
  shopId!: string

  @ManyToOne(() => Shop, (shop) => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop!: Shop

  @OneToMany(() => ProductAttribute, (attr) => attr.product, { cascade: true, nullable: false })
  attributes!: ProductAttribute[]

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true, nullable: false })
  variants!: ProductVariant[]

  @OneToMany(() => Comment, (comment) => comment.product)
  comments!: Comment[]

  @OneToMany(() => Review, (review) => review.product)
  reviews!: Review[]
}

<!-- AttributeValue.ts -->
import { Column, Entity, OneToMany } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { ProductAttribute } from '@/model/ProductAttribute'

@Entity('tbl_attribute')
export class AttributeValue extends AbstractModel {
  @Column({ nullable: false })
  value!: string

  @OneToMany(() => ProductAttribute, (attribute) => attribute.value)
  attributes!: ProductAttribute[]
}

<!-- ProductAttribute.ts -->
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Product } from '@/model/Product'
import { AttributeValue } from '@/model/AttributeValue'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_product_attribute')
export class ProductAttribute extends AbstractModel {
  @Column({ nullable: false })
  name!: string

  @ManyToOne(() => Product, (product) => product.attributes, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToOne(() => AttributeValue, (value) => value.attributes, { eager: true, nullable: false })
  @JoinColumn({ name: 'attribute_id' })
  value!: AttributeValue
}

<!-- ProductVariant.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { Product } from '@/model/Product'
import { VariantOption } from '@/model/VariantOption'

@Entity('tbl_product_variant')
export class ProductVariant extends AbstractModel {
  @Column({ nullable: false })
  sku!: string

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price!: number

  @Column('decimal', { precision: 10, scale: 2, name: 'old_price', nullable: false })
  oldPrice!: number

  @Column({ nullable: false })
  stock!: number

  @Index()
  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToMany(() => VariantOption)
  @JoinTable({
    name: 'tbl_product_variant_option',
    joinColumn: { name: 'variant_id' },
    inverseJoinColumn: { name: 'option_id' }
  })
  options!: VariantOption[]
}

<!-- Variant.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, OneToMany } from 'typeorm'
import { VariantOption } from '@/model/VariantOption'

@Entity('tbl_variant')
export class Variant extends AbstractModel {
  @Column({ nullable: false })
  name!: string

  @OneToMany(() => VariantOption, (option) => option.variant)
  options!: VariantOption[]
}

<!-- VariantOption.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Variant } from '@/model/Variant'
import { Image } from '@/model/Image'

@Entity('tbl_variant_value')
export class VariantOption extends AbstractModel {
  @Column()
  value!: string

  @ManyToOne(() => Variant, { eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant!: Variant

  @ManyToOne(() => Image, { nullable: true, eager: true })
  @JoinColumn({ name: 'image_id' })
  image!: Image
}

<!-- ProductService.ts -->
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
  serializeProduct
} from '@/utils/helper'
import { PaginationUtils } from '@/utils/PaginationUtilsV2'
import { Request } from 'express'
import { Product } from '@/model/Product'
import { Like } from 'typeorm'
import { DecodedJwtToken } from './JwtService'

class ProductService {
  async createProduct(body: ProductSchemaType, user: DecodedJwtToken) {
    // Create a new product
    const { attributes, variants, categoryId, thumbnail, images, ...rest } = body
    const imagesSet = new Set(images)
    if (imagesSet.size < 5) {
      throw new ValidationError('At least 5 images are required', [
        new EntityError('images', 'At least 5 images are required')
      ])
    }

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
      const shop = await shopRepo.findByOwner(user.payload.id)
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
        slug: generateSlug(rest.name),
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

      // return serializeProduct(savedProduct)
      return savedProduct
    })
  }

  async updateProduct(id: string, body: ProductSchemaType, user: DecodedJwtToken) {
    return AppDataSource.manager.transaction(async (manager) => {
      const productRepo = manager.withRepository(ProductRepository)
      const categoryRepo = manager.withRepository(CategoryRepository)
      const imageRepo = manager.withRepository(ImageRepository)
      const productAttributeRepo = manager.withRepository(ProductAttributeRepository)
      const attributeRepo = manager.withRepository(AttributeValueRepository)
      const productVariantRepo = manager.withRepository(ProductVariantRepository)
      const variantRepo = manager.withRepository(VariantRepository)
      const variantOptionRepo = manager.withRepository(VariantOptionRepository)

      // Lấy sản phẩm theo slug
      const product = await productRepo.findById(id, {
        attributes: true,
        variants: { options: { image: true, variant: true } },
        thumbnail: true,
        images: true,
        category: true,
        shop: { owner: true }
      })
      if (!product) throw new BadRequestError('Product not found')

      // Kiểm tra quyền sở hữu sản phẩm
      if (product.shop.owner.id !== user.payload.id) {
        throw new UnauthorizedError('You are not authorized to update this product')
      }

      // Destructure dữ liệu từ body
      const { attributes, variants, categoryId, thumbnail, images, ...rest } = body

      // Nếu categoryId thay đổi thì cập nhật
      if (categoryId && product.category.id !== categoryId) {
        const newCategory = await categoryRepo.findById(categoryId)
        if (!newCategory) {
          throw new ValidationError('Category not found', [new EntityError('categoryId', 'Category not found')])
        }
        product.category = newCategory
      }

      // Kiểm tra và cập nhật thumbnail nếu có thay đổi
      if (thumbnail && thumbnail !== product.thumbnail.fileName) {
        const thumbnailImage = await imageRepo.findByFileName(thumbnail)
        if (!thumbnailImage) {
          throw new ValidationError('Image not found', [new EntityError('thumbnail', 'Image not found')])
        }
        product.thumbnail = thumbnailImage
      }

      // Kiểm tra và cập nhật images nếu được truyền vào
      if (images && images.length > 0) {
        const imagesSet = new Set(images)
        if (imagesSet.size < 5) {
          throw new ValidationError('At least 5 images are required', [
            new EntityError('images', 'At least 5 images are required')
          ])
        }
        const otherImages = await imageRepo.findByFilenames([...imagesSet])
        if (imagesSet.size !== otherImages.length) {
          throw new ValidationError('Image not found', [new EntityError('images', 'Image not found')])
        }
        product.images = otherImages
      }

      // Cập nhật các trường thông tin cơ bản, nếu tên thay đổi thì cập nhật slug
      if (rest.name && rest.name !== product.name) {
        product.slug = generateSlug(rest.name)
      }
      productRepo.merge(product, rest)

      // Cập nhật attributes nếu có
      if (attributes) {
        // Xóa toàn bộ attributes cũ của sản phẩm
        await productAttributeRepo.delete({ product: { id: product.id } })
        product.attributes = await this.checkAndCreateAttribute(
          attributes,
          product,
          attributeRepo,
          productAttributeRepo
        )
      }

      // Cập nhật variants nếu có
      if (variants) {
        // Xóa toàn bộ product variants cũ
        await productVariantRepo.delete({ product: { id: product.id } })
        product.variants = await this.checkAndCreateVariant(
          variants,
          product,
          variantRepo,
          variantOptionRepo,
          productVariantRepo,
          imageRepo
        )
      }

      const updatedProduct = await productRepo.save(product)
      return serializeProduct(updatedProduct)
    })
  }

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
        shop: slug ? { slug } : undefined,
        name: req.query.name ? Like(`%${req.query.name}%`) : undefined,
        ...((req.query.categoryId && { category: { id: req.query.categoryId } }) as any)
      },
      {
        variants: true,
        thumbnail: true,
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

