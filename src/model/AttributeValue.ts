import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { ProductAttribute } from '@/model/ProductAttribute'
import { Attribute } from './Attribute'

@Entity('tbl_attribute_value')
@Unique('unique_attribute_value', ['value', 'attribute'])
export class AttributeValue extends AbstractModel {
  @Column({ nullable: false })
  value!: string // Ví dụ: "Red", "Blue"

  @ManyToOne(() => Attribute, (attribute) => attribute.values)
  @JoinColumn({ name: 'attribute_id' })
  attribute!: Attribute

  @OneToMany(() => ProductAttribute, (pa) => pa.value)
  productAttributes!: ProductAttribute[]
}
