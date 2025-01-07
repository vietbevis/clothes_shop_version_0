import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Product } from '@/model/Product'
import { AttributeValue } from '@/model/AttributeValue'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_product_attribute')
export class ProductAttribute extends AbstractModel {
  @Column({ nullable: false })
  name!: string

  @ManyToOne(() => Product, (product) => product.attributes, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToOne(() => AttributeValue, (value) => value.attributes, { eager: true, nullable: false })
  @JoinColumn({ name: 'attribute_id' })
  value!: AttributeValue
}
