import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Variant } from '@/model/Variant'
import { Image } from '@/model/Image'

@Entity('tbl_variant_value')
export class VariantOption extends AbstractModel {
  @Column()
  value!: string

  @ManyToOne(() => Variant, { eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant!: Variant

  @ManyToOne(() => Image, { nullable: true, eager: true })
  @JoinColumn({ name: 'image_id' })
  image!: Image
}
