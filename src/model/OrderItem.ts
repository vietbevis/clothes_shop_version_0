import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { Order } from './Order'
import { Product } from './Product'
import { ProductVariant } from './ProductVariant'

@Entity('tbl_order_item')
export class OrderItem extends AbstractModel {
  @ManyToOne(() => Order, (order) => order.items, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @ManyToOne(() => Product, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant

  @Column({ nullable: false })
  quantity!: number

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number

  @Column({ nullable: false })
  sku!: string

  @Column('json', { nullable: false })
  variantOptions!: ProductVariant
}
