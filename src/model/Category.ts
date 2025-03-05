import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  RelationId,
  Tree,
  TreeChildren,
  TreeLevelColumn,
  TreeParent
} from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { Product } from '@/model/Product'
import { Image } from '@/model/Image'

@Entity('tbl_category')
@Tree('closure-table')
export class Category extends AbstractModel {
  @Column({ nullable: false, unique: true })
  name!: string

  @Column({ nullable: false, unique: true })
  slug!: string

  @Column({ type: 'text', nullable: true })
  description!: string

  @TreeChildren({ cascade: true })
  children!: Category[]

  @TreeParent({ onDelete: 'CASCADE' })
  parent!: Category | null

  @TreeLevelColumn()
  @Column({ default: 1 })
  level!: number

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[]

  @Column({ name: 'image_url', default: '' })
  imageUrl!: string
}
