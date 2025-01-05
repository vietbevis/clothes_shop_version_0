import { Column, Entity } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_resource')
export class Resource extends AbstractModel {
  @Column()
  name!: string
}
