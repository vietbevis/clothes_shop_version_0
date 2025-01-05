import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { Role } from '@/model/Role'
import { Resource } from '@/model/Resource'

@Entity('tbl_permission')
export class Permission extends AbstractModel {
  @Column({ type: 'varchar', length: 50, nullable: false })
  name!: string

  @Column({ type: 'varchar' })
  description!: string

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[]

  @ManyToOne(() => Resource)
  resource!: Resource
}
