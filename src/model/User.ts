import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne } from 'typeorm'
import { Role } from '@/model/Role'
import { UserStatus } from '@/utils/enums'
import { compare } from 'bcryptjs'
import { UserDevice } from '@/model/UserDevice'
import { Address } from '@/model/Address'
import { Profile } from '@/model/Profile'
import { Image } from '@/model/Image'

@Entity('tbl_user')
export class User extends AbstractModel {
  @Column({ type: 'varchar', length: 50, nullable: false })
  username!: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  email!: string

  @Column({ type: 'varchar', nullable: false })
  password!: string

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  fullName!: string

  @OneToOne(() => Image, { cascade: true })
  @JoinColumn({ name: 'avatar' })
  avatar!: Image

  @OneToOne(() => Image, { cascade: true })
  @JoinColumn({ name: 'coverPhoto' })
  coverPhoto!: Image

  @Column({ type: 'varchar', name: 'provider_id', default: '' })
  providerId!: string

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.NOT_VERIFIED })
  status!: UserStatus

  @ManyToMany(() => Role)
  @JoinTable()
  roles!: Role[]

  @OneToMany(() => UserDevice, (device) => device.user)
  devices!: UserDevice[]

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses!: Address[]

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile!: Profile

  async comparePassword(password: string) {
    return compare(password, this.password)
  }
}
