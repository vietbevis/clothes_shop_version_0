import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { User } from './User'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_image')
export class Image extends AbstractModel {
  @Column({ name: 'file_name', unique: true })
  fileName!: string

  @Column()
  width!: number

  @Column()
  height!: number

  @Column({ name: 'user_id', select: false })
  userId!: string

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
