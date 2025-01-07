import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity } from 'typeorm'

@Entity('tbl_variant')
export class Variant extends AbstractModel {
  @Column({ nullable: false })
  name!: string
}
