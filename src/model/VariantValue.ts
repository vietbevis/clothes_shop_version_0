import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Image } from '@/model/Image'
import { Variant } from '@/model/Variant'

@Entity('tbl_variant_value')
export class VariantValue extends AbstractModel {
  @Column()
  value!: string

  @ManyToOne(() => Image, { eager: true })
  @JoinColumn({ name: 'image_id' })
  image!: Image

  @ManyToOne(() => Variant)
  @JoinColumn({ name: 'variant_id' })
  variant!: Variant
}
