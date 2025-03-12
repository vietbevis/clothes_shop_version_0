import { AbstractModel } from './base/AbstractModel'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { Shop } from './Shop'
import { Product } from './Product'
import { DiscountType, VoucherType } from '@/utils/enums'
import { VoucherUsage } from './VoucherUsage'

@Entity('tbl_voucher')
export class Voucher extends AbstractModel {
  @Column({ nullable: false, unique: true })
  code!: string // Mã voucher duy nhất

  @Column({ type: 'text', nullable: true })
  description?: string // Mô tả voucher

  @Column({ type: 'enum', enum: VoucherType })
  type!: VoucherType // Loại voucher: SYSTEM hoặc SHOP

  @Column({ type: 'enum', enum: DiscountType })
  discountType!: DiscountType // Loại giảm giá: PERCENTAGE, FIXED, FREESHIP

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountValue?: number // Giá trị giảm giá (phần trăm hoặc số tiền cố định)

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxDiscount?: number // Giảm giá tối đa (dùng cho PERCENTAGE)

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderValue?: number // Giá trị đơn hàng tối thiểu để áp dụng

  @Column({ nullable: true })
  startDate?: Date // Ngày bắt đầu hiệu lực

  @Column({ nullable: true })
  endDate?: Date // Ngày hết hiệu lực

  @Column({ default: 0 })
  usageLimit?: number // Số lượng người dùng tối đa

  @Column({ default: 0 })
  usedCount: number = 0 // Số lượng đã sử dụng

  // Giới hạn số lần sử dụng voucher cho mỗi user
  @Column({ default: 1 })
  perUserLimit!: number

  @ManyToOne(() => Shop, { nullable: true })
  @JoinColumn({ name: 'shop_slug', referencedColumnName: 'slug' })
  shop?: Shop // Shop sở hữu voucher (nếu là SHOP)

  // Voucher có thể áp dụng cho một số sản phẩm cụ thể
  @ManyToMany(() => Product)
  @JoinTable({
    name: 'tbl_voucher_product',
    joinColumn: {
      name: 'voucher_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id'
    }
  })
  applicableProducts?: Product[]

  @Column({ default: false })
  isForNewUser: boolean = false // Voucher cho người dùng mới

  // Liên kết để theo dõi lượt sử dụng của từng voucher
  @OneToMany(() => VoucherUsage, (usage) => usage.voucher)
  voucherUsages!: VoucherUsage[]
}
