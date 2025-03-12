import { Column, Entity, JoinColumn, ManyToOne, Tree, TreeChildren, TreeLevelColumn, TreeParent } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { User } from '@/model/User'
import { Product } from '@/model/Product'

@Entity('tbl_comment')
@Tree('closure-table')
export class Comment extends AbstractModel {
  @Column({ type: 'text', nullable: false })
  content!: string

  @TreeChildren({ cascade: true })
  replies!: Comment[]

  @TreeParent({ onDelete: 'CASCADE' })
  parent!: Comment

  @Column({ default: 1 })
  level!: number

  @Column({ name: 'user_id', nullable: false })
  userId!: string

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'product_slug', nullable: false })
  productSlug!: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_slug', referencedColumnName: 'slug' })
  product!: Product
}
