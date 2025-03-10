import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { User } from '@/model/User'
import { Product } from '@/model/Product'
import { Image } from '@/model/Image'
import { ShopStatus } from '@/utils/enums'
import { Address } from '@/model/Address'

@Entity('tbl_shop')
export class Shop extends AbstractModel {
  @Column({ nullable: false, type: 'nvarchar' })
  name!: string

  @Column({ nullable: false })
  slogan!: string

  @Column({ nullable: false, unique: true })
  slug!: string

  @OneToOne(() => Address, { nullable: false, cascade: true, orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'address_id' })
  address!: Address

  @Column({ type: 'text', nullable: false })
  description!: string

  @Column({ type: 'enum', enum: ShopStatus, default: ShopStatus.PENDING })
  status!: ShopStatus

  @OneToOne(() => User, (user) => user.shop, { cascade: true })
  owner!: User

  @OneToMany(() => Product, (product) => product.shop)
  products!: Product[]

  @Column({ name: 'logo_id', default: '' })
  logoUrl!: string

  @Column({ name: 'banner_id', default: '' })
  bannerUrl!: string
}
