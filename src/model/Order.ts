import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { User } from './User'
import { OrderItem } from './OrderItem'
import { OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from '@/utils/enums'
import { Address } from './Address'
import { Voucher } from './Voucher'

@Entity('tbl_order')
export class Order extends AbstractModel {
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus

  @ManyToOne(() => Address, { nullable: false })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress!: Address

  @Column({ type: 'enum', enum: ShippingMethod })
  shippingMethod!: ShippingMethod

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingFee!: number

  @Column({ type: 'text', nullable: true })
  customerNote?: string

  // Sau sẽ add thêm các trường khác như: mã giảm giá, mã vận chuyển, mã thanh toán, ...
  @ManyToMany(() => Voucher, { nullable: true })
  @JoinTable({
    name: 'tbl_order_voucher',
    joinColumn: { name: 'order_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'voucher_id', referencedColumnName: 'code' }
  })
  vouchers!: Voucher[]

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[]
}
