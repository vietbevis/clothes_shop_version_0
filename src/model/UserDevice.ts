import { Column, Entity, ManyToOne, Unique } from 'typeorm'
import { User } from './User'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_user_device')
@Unique(['deviceName', 'deviceType', 'user'])
export class UserDevice extends AbstractModel {
  @Column({ name: 'device_name', type: 'varchar' })
  deviceName!: string

  @Column({ name: 'device_type', type: 'varchar' })
  deviceType!: string

  @Column({ name: 'ip_address', type: 'varchar', length: 50 })
  ipAddress!: string

  @Column({ name: 'last_login_at', type: 'timestamp' })
  lastLoginAt!: Date

  @Column({ name: 'is_active', default: true })
  isActive!: boolean

  @ManyToOne(() => User, (user) => user.devices)
  user!: User
}
