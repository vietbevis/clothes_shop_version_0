import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { Product } from '@/model/Product'

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
}
