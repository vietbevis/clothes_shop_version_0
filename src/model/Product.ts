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

  @Column({ name: 'images', nullable: false, type: 'json' })
  images!: string[]

  @Column({ type: 'text', nullable: false })
  description!: string

  @Column({ name: 'category_id', nullable: false })
  categoryId!: string

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.AVAILABLE })
  status!: ProductStatus

  @Column({ nullable: true, name: 'shop_slug' })
  shopSlug!: string

  @ManyToOne(() => Shop, (shop) => shop.products)
  @JoinColumn({ name: 'shop_slug', referencedColumnName: 'slug' })
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
