import { Column, Entity, OneToMany } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { ProductAttribute } from '@/model/ProductAttribute'

@Entity('tbl_attribute')
export class AttributeValue extends AbstractModel {
  @Column({ nullable: false })
  value!: string

  @OneToMany(() => ProductAttribute, (attribute) => attribute.value)
  attributes!: ProductAttribute[]
}
