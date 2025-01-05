import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'
import { User } from '@/model/User'
import { Permission } from '@/model/Permisstion'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_role')
export class Role extends AbstractModel {
  @Column()
  name!: string

  @Column()
  description!: string

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[]

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions!: Permission[]
}
