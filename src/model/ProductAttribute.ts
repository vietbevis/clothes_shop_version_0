import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Product } from '@/model/Product'
import { AttributeValue } from '@/model/AttributeValue'
import { AbstractModel } from '@/model/base/AbstractModel'
import { Attribute } from './Attribute'

@Entity('tbl_product_attribute')
export class ProductAttribute extends AbstractModel {
  @ManyToOne(() => Product, (product) => product.attributes)
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToOne(() => Attribute)
  @JoinColumn({ name: 'attribute_id' })
  attribute!: Attribute

  @ManyToOne(() => AttributeValue, (value) => value.productAttributes)
  @JoinColumn({ name: 'attribute_value_id' })
  value!: AttributeValue
}
