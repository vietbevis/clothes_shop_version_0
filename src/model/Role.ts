import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'
import { User } from '@/model/User'
import { Permission } from '@/model/Permisstion'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_role')
export class Role extends AbstractModel {
  @Column({ nullable: false })
  name!: string

  @Column({ default: '', length: 255 })
  description!: string

  @Column({ default: true, type: 'boolean' })
  isActive!: boolean

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[]

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'tbl_role_permission',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' }
  })
  permissions!: Permission[]
}
