import { Column, Entity, OneToMany } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { AttributeValue } from './AttributeValue'

@Entity('tbl_attribute')
export class Attribute extends AbstractModel {
  @Column({ nullable: false, unique: true })
  name!: string

  @OneToMany(() => AttributeValue, (value) => value.attribute)
  values!: AttributeValue[]
}
