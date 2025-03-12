<!-- Product.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { Category } from '@/model/Category'
import { ProductAttribute } from '@/model/ProductAttribute'
import { Comment } from '@/model/Comment'
import { Review } from '@/model/Review'
import { Shop } from '@/model/Shop'
import { ProductStatus } from '@/utils/enums'
import { ProductVariant } from '@/model/ProductVariant'

@Entity('tbl_product')
export class Product extends AbstractModel {
  @Column({ nullable: false })
  name!: string

  @Column({ nullable: false, unique: true })
  slug!: string

  @Column({ name: 'images', nullable: false, type: 'json' })
  images!: string[]

  @Column({ type: 'text', nullable: false })
  description!: string

  @Column({ name: 'category_id', nullable: false })
  categoryId!: string

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.AVAILABLE })
  status!: ProductStatus

  @Column({ nullable: true, name: 'shop_slug' })
  shopSlug!: string

  @ManyToOne(() => Shop, (shop) => shop.products, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'shop_slug', referencedColumnName: 'slug' })
  shop!: Shop

  @OneToMany(() => ProductAttribute, (attr) => attr.product, { cascade: true, nullable: false })
  attributes!: ProductAttribute[]

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true, nullable: false })
  variants!: ProductVariant[]

  @OneToMany(() => Comment, (comment) => comment.product)
  comments!: Comment[]

  @OneToMany(() => Review, (review) => review.product)
  reviews!: Review[]
}


<!-- AttributeValue.ts -->
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { ProductAttribute } from '@/model/ProductAttribute'
import { Attribute } from './Attribute'

@Entity('tbl_attribute_value')
@Unique('unique_attribute_value', ['value', 'attribute'])
export class AttributeValue extends AbstractModel {
  @Column({ nullable: false })
  value!: string // Ví dụ: "Red", "Blue"

  @ManyToOne(() => Attribute, (attribute) => attribute.values)
  @JoinColumn({ name: 'attribute_id' })
  attribute!: Attribute

  @OneToMany(() => ProductAttribute, (pa) => pa.value)
  productAttributes!: ProductAttribute[]
}

<!-- ProductAttribute.ts -->
import { Entity, JoinColumn, ManyToOne } from 'typeorm'
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

<!-- ProductVariant.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, Unique } from 'typeorm'
import { Product } from '@/model/Product'
import { VariantOption } from '@/model/VariantOption'

@Entity('tbl_product_variant')
@Unique(['sku', 'product'])
export class ProductVariant extends AbstractModel {
  @Column({ nullable: false })
  sku!: string

  @Column({ name: 'image_id', default: '' })
  imageUrl!: string

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price!: number

  @Column('decimal', { precision: 10, scale: 2, name: 'old_price', nullable: false })
  oldPrice!: number

  @Column({ nullable: false })
  stock!: number

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToMany(() => VariantOption)
  @JoinTable({
    name: 'tbl_product_variant_option',
    joinColumn: {
      name: 'variant_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'option_id',
      referencedColumnName: 'id'
    }
  })
  options!: VariantOption[]
}

<!-- Variant.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, OneToMany } from 'typeorm'
import { VariantOption } from '@/model/VariantOption'

@Entity('tbl_variant')
export class Variant extends AbstractModel {
  @Column({ nullable: false, unique: true })
  name!: string

  @OneToMany(() => VariantOption, (option) => option.variant)
  options!: VariantOption[]
}

<!-- VariantOption.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { Variant } from '@/model/Variant'

@Entity('tbl_variant_option')
@Unique(['value', 'variant'])
export class VariantOption extends AbstractModel {
  @Column({ nullable: false })
  value!: string

  @ManyToOne(() => Variant, { eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant!: Variant
}

<!-- Order.ts -->
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { User } from './User'
import { OrderItem } from './OrderItem'
import { OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from '@/utils/enums'
import { Address } from './Address'

@Entity('tbl_order')
export class Order extends AbstractModel {
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice!: number

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus

  @ManyToOne(() => Address, { nullable: false })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress!: Address

  @Column({ type: 'enum', enum: ShippingMethod })
  shippingMethod!: ShippingMethod

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingFee!: number

  @Column({ type: 'text', nullable: true })
  customerNote?: string

  // Sau sẽ add thêm các trường khác như: mã giảm giá, mã vận chuyển, mã thanh toán, ...

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[]
}

<!-- OrderItem.ts -->
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { Order } from './Order'
import { Product } from './Product'
import { ProductVariant } from './ProductVariant'

@Entity('tbl_order_item')
export class OrderItem extends AbstractModel {
  @ManyToOne(() => Order, (order) => order.items, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @ManyToOne(() => Product, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant

  @Column({ nullable: false })
  quantity!: number

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number

  @Column({ nullable: false })
  sku!: string

  @Column('json', { nullable: false })
  variantOptions!: ProductVariant
}

<!-- CartItem.ts -->
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { ProductVariant } from './ProductVariant'
import { Product } from './Product'
import { User } from './User'

@Entity('tbl_cart_item')
export class CartItem extends AbstractModel {
  @ManyToOne(() => User, (user) => user.cart, { nullable: true, onDelete: 'SET NULL', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Product, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', onUpdate: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant

  @Column({ nullable: false })
  quantity!: number
}

<!-- User.ts -->
import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, RelationId } from 'typeorm'
import { Role } from '@/model/Role'
import { UserStatus } from '@/utils/enums'
import { compare } from 'bcryptjs'
import { UserDevice } from '@/model/UserDevice'
import { Address } from '@/model/Address'
import { Profile } from '@/model/Profile'
import { Image } from '@/model/Image'
import { Shop } from '@/model/Shop'
import { CartItem } from './CartItem'
import { Order } from './Order'

@Entity('tbl_user')
export class User extends AbstractModel {
  @Column({ type: 'varchar', length: 50, nullable: false })
  username!: string

  @Column({ type: 'varchar', length: 70, nullable: false })
  email!: string

  @Column({ type: 'varchar', nullable: false })
  password!: string

  @Column({ type: 'varchar', name: 'provider_id', default: '' })
  providerId!: string

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.NOT_VERIFIED })
  status!: UserStatus

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'tbl_user_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  roles!: Role[]

  @Column({ name: 'shop_slug', default: null })
  shopSlug!: string

  @OneToOne(() => Shop, (shop) => shop.owner, { onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  @JoinColumn({ name: 'shop_slug', referencedColumnName: 'slug' })
  shop!: Shop

  @OneToMany(() => UserDevice, (device) => device.user)
  devices!: UserDevice[]

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses!: Address[]

  @OneToMany(() => CartItem, (item) => item.user)
  cart!: CartItem[]

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[]

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile!: Profile

  async comparePassword(password: string) {
    return compare(password, this.password)
  }
}
