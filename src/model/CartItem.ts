import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { ProductVariant } from './ProductVariant'
import { Product } from './Product'
import { User } from './User'

@Entity('tbl_cart_item')
export class CartItem extends AbstractModel {
  @ManyToOne(() => User, (user) => user.cart, { nullable: true, onDelete: 'SET NULL', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Product, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant

  @Column({ nullable: false })
  quantity!: number
}
