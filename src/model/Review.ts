import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { User } from '@/model/User'
import { Product } from '@/model/Product'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_product_review')
export class Review extends AbstractModel {
  @Column({ type: 'int', default: 5 })
  rating!: number

  @Column({ nullable: true, type: 'text' })
  content!: string

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product!: Product
}
