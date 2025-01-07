import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { User } from '@/model/User'
import { Product } from '@/model/Product'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_product_rating')
export class ProductRating extends AbstractModel {
  @Column()
  rating!: number

  @Column({ nullable: true, type: 'text' })
  review!: string

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product!: Product
}
