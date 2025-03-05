import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { User } from './User'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_user_device')
@Unique(['deviceId', 'userId', 'ipAddress'], { deferrable: 'INITIALLY IMMEDIATE' })
export class UserDevice extends AbstractModel {
  @Column({ name: 'device_name', type: 'varchar' })
  deviceName!: string

  @Column({ name: 'device_id', type: 'varchar' })
  deviceId!: string

  @Column({ name: 'user_id', nullable: false })
  userId!: string

  @Column({ name: 'ip_address', type: 'varchar', length: 50 })
  ipAddress!: string

  @Column({ name: 'last_login_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastLoginAt!: Date

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @ManyToOne(() => User, (user) => user.devices)
  @JoinColumn({ name: 'user_id' })
  user!: User
}
