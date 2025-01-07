import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, VirtualColumn } from 'typeorm'
import { Category } from '@/model/Category'
import { ProductAttribute } from '@/model/ProductAttribute'
import { Comment } from '@/model/Comment'
import { ProductRating } from '@/model/ProductRating'
import { Shop } from '@/model/Shop'
import { Image } from '@/model/Image'
import { ProductStatus } from '@/utils/enums'
import { ProductVariant } from '@/model/ProductVariant'

@Entity('tbl_product')
export class Product extends AbstractModel {
  @Column({ nullable: false })
  name!: string

  @Column({ nullable: false })
  slug!: string

  @ManyToOne(() => Image, { eager: true })
  @JoinColumn({ name: 'thumbnail' })
  thumbnail!: Image

  @VirtualColumn({
    query: (alias) => `SELECT COALESCE(MIN(price), 0) FROM tbl_product_variant WHERE product_id = ${alias}.id`
  })
  price!: number

  @ManyToMany(() => Image)
  @JoinTable()
  images!: Image[]

  @Column({ type: 'text', nullable: false })
  description!: string

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.AVAILABLE })
  status!: ProductStatus

  @ManyToOne(() => Shop, (shop) => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop!: Shop

  @OneToMany(() => ProductAttribute, (attr) => attr.product, { cascade: true, nullable: false })
  attributes!: ProductAttribute[]

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true, nullable: false })
  variants!: ProductVariant[]

  @OneToMany(() => Comment, (comment) => comment.product)
  comments!: Comment[]

  @OneToMany(() => ProductRating, (rating) => rating.product)
  ratings!: ProductRating[]
}
