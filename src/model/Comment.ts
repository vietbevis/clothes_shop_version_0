import { Column, Entity, JoinColumn, ManyToOne, Tree, TreeChildren, TreeLevelColumn, TreeParent } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { User } from '@/model/User'
import { Product } from '@/model/Product'

@Entity('tbl_comment')
@Tree('closure-table')
export class Comment extends AbstractModel {
  @Column()
  content!: string

  @TreeChildren()
  replies!: Comment[]

  @TreeParent()
  parent!: Comment

  @TreeLevelColumn()
  @Column({ default: 1 })
  level!: number

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product
}
