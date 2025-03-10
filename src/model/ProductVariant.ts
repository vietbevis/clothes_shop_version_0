import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, Unique } from 'typeorm'
import { Product } from '@/model/Product'
import { VariantOption } from '@/model/VariantOption'

@Entity('tbl_product_variant')
@Unique(['sku', 'product'])
export class ProductVariant extends AbstractModel {
  @Column({ nullable: false })
  sku!: string

  @Column({ name: 'image_id', default: '' })
  imageUrl!: string

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price!: number

  @Column('decimal', { precision: 10, scale: 2, name: 'old_price', nullable: false })
  oldPrice!: number

  @Column({ nullable: false })
  stock!: number

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToMany(() => VariantOption)
  @JoinTable({
    name: 'tbl_product_variant_option',
    joinColumn: {
      name: 'variant_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'option_id',
      referencedColumnName: 'id'
    }
  })
  options!: VariantOption[]
}
