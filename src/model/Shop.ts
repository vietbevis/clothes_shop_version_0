import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, OneToMany, OneToOne, VirtualColumn } from 'typeorm'
import { User } from '@/model/User'
import { Product } from '@/model/Product'
import { Image } from '@/model/Image'
import { ShopStatus } from '@/utils/enums'

@Entity('tbl_shop')
export class Shop extends AbstractModel {
  @Column()
  name!: string

  @Column({ nullable: false })
  slug!: string

  @Column()
  description!: string

  @VirtualColumn({ query: (shop) => `SELECT COUNT(id) FROM tbl_product WHERE shop_id = ${shop}.id` })
  totalProducts!: number

  @Column({ type: 'enum', enum: ShopStatus, default: ShopStatus.OPEN })
  status!: ShopStatus

  @OneToOne(() => User, (user) => user.shop)
  @JoinColumn()
  owner!: User

  @OneToMany(() => User, (user) => user.staffIn)
  staff!: User[]

  @OneToMany(() => Product, (product) => product.shop)
  products!: Product[]

  @OneToOne(() => Image, { eager: true })
  @JoinColumn()
  logo!: Image

  @OneToOne(() => Image, { eager: true })
  @JoinColumn()
  banner!: Image
}
