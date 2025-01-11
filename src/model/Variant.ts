import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, OneToMany } from 'typeorm'
import { VariantOption } from '@/model/VariantOption'

@Entity('tbl_variant')
export class Variant extends AbstractModel {
  @Column({ nullable: false })
  name!: string

  @OneToMany(() => VariantOption, (option) => option.variant)
  options!: VariantOption[]
}
