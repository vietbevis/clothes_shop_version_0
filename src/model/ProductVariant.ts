import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { Product } from '@/model/Product'
import { VariantOption } from '@/model/VariantOption'

@Entity('tbl_product_variant')
export class ProductVariant extends AbstractModel {
  @Column()
  sku!: string

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number

  @Column('decimal', { precision: 10, scale: 2, name: 'old_price' })
  oldPrice!: number

  @Column()
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
