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