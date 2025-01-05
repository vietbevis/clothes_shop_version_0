import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { User } from './User'
import { ImageType } from '@/utils/enums'
import { AbstractModel } from '@/model/base/AbstractModel'

@Entity('tbl_image')
@Unique(['fileName', 'type', 'userId'])
export class Image extends AbstractModel {
  @Column()
  fileName!: string

  @Column()
  width!: number

  @Column()
  height!: number

  @Column({ type: 'enum', enum: ImageType, nullable: false })
  type!: string

  @Column({ name: 'user_id', select: false })
  userId!: string

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
