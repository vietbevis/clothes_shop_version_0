import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, Unique, VirtualColumn } from 'typeorm'
import { User } from '@/model/User'
import { Product } from '@/model/Product'
import { Image } from '@/model/Image'
import { ShopStatus } from '@/utils/enums'
import { Address } from '@/model/Address'

@Entity('tbl_shop')
@Unique(['owner'])
export class Shop extends AbstractModel {
  @Column({ nullable: false, type: 'nvarchar' })
  name!: string

  @Column({ nullable: false })
  slogan!: string

  @Column({ nullable: false, unique: true })
  slug!: string

  @ManyToOne(() => Address, { nullable: false, cascade: true })
  @JoinColumn({ name: 'address_id' })
  address!: Address

  @Column({ type: 'text', nullable: false })
  description!: string

  @VirtualColumn({ query: (shop) => `SELECT COUNT(id) FROM tbl_product WHERE shop_id = ${shop}.id` })
  totalProducts!: number

  @Column({ type: 'enum', enum: ShopStatus, default: ShopStatus.PENDING })
  status!: ShopStatus

  @OneToOne(() => User, (user) => user.shop)
  @JoinColumn({ name: 'owner_id' })
  owner!: User

  @OneToMany(() => User, (user) => user.staffIn)
  staff!: User[]

  @OneToMany(() => Product, (product) => product.shop)
  products!: Product[]

  @ManyToOne(() => Image)
  @JoinColumn({ name: 'logo_id' })
  logo!: Image

  @ManyToOne(() => Image)
  @JoinColumn({ name: 'banner_id' })
  banner!: Image
}
