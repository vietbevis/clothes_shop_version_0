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
