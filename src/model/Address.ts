import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { User } from '@/model/User'

@Entity('tbl_address')
export class Address extends AbstractModel {
  // Số nhà
  @Column({ name: 'street_number', type: 'varchar', length: 50, nullable: true })
  streetNumber!: string

  // Tên đường
  @Column({ name: 'street_name', type: 'nvarchar', length: 255, nullable: true })
  streetName!: string

  // Phường/Xã
  @Column({ name: 'ward', type: 'nvarchar', length: 100, nullable: true })
  ward!: string

  // Quận/Huyện
  @Column({ name: 'district', type: 'nvarchar', length: 100, nullable: true })
  district!: string

  // Tỉnh/Thành phố
  @Column({ name: 'province', type: 'nvarchar', length: 100, nullable: true })
  province!: string

  // Ghi chú bổ sung cho địa chỉ (nếu có)
  @Column({ name: 'note', type: 'text', nullable: true })
  note!: string

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean

  @Index()
  @Column({ name: 'user_id', select: false, nullable: true })
  userId!: string

  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'user_id' })
  user!: User
}
