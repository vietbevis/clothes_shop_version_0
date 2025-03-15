import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { Role } from '@/model/Role'
import { UserStatus } from '@/utils/enums'
import { compare } from 'bcryptjs'
import { UserDevice } from '@/model/UserDevice'
import { Address } from '@/model/Address'
import { Profile } from '@/model/Profile'
import { Image } from '@/model/Image'
import { Shop } from '@/model/Shop'
import { CartItem } from './CartItem'
import { Order } from './Order'

@Entity('tbl_user')
export class User extends AbstractModel {
  @Column({ type: 'varchar', length: 50, nullable: false })
  username!: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  email!: string

  @Column({ type: 'varchar', nullable: false })
  password!: string

  @Column({ type: 'varchar', name: 'google_id', default: '' })
  googleId!: string

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.NOT_VERIFIED })
  status!: UserStatus

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'tbl_user_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  roles!: Role[]

  @Column({ name: 'shop_slug', default: null })
  shopSlug!: string

  @OneToOne(() => Shop, (shop) => shop.owner, { onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'shop_slug', referencedColumnName: 'slug' })
  shop!: Shop

  @OneToMany(() => UserDevice, (device) => device.user)
  devices!: UserDevice[]

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses!: Address[]

  @OneToMany(() => CartItem, (item) => item.user)
  cart!: CartItem[]

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[]

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile!: Profile

  async comparePassword(password: string) {
    return compare(password, this.password)
  }
}
