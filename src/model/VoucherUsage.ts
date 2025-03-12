import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { Voucher } from './Voucher'
import { User } from './User'

@Entity('tbl_voucher_usage')
export class VoucherUsage extends AbstractModel {
  @ManyToOne(() => Voucher, (voucher) => voucher.voucherUsages)
  @JoinColumn({ name: 'voucher_id' })
  voucher!: Voucher

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  // Số lần voucher đã được sử dụng bởi user này
  @Column({ default: 1 })
  usageCount!: number
}
