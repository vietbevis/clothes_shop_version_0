import { Column, Entity, ManyToMany, Unique } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { HttpMethod } from '@/utils/enums'
import { Role } from './Role'

@Entity('tbl_permission')
@Unique(['name', 'apiPath', 'method', 'resource'])
export class Permission extends AbstractModel {
  @Column({ type: 'varchar', length: 150, nullable: false })
  name!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  apiPath!: string

  @Column({ type: 'enum', enum: HttpMethod, nullable: false })
  method!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  resource!: string

  @ManyToMany(() => Role, (role) => role.permissions, { onDelete: 'CASCADE' })
  roles!: Role[]
}
