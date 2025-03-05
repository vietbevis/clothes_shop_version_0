import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from './User'

@Entity('tbl_image')
@Index('idx_user_id', ['userId', 'fileName'], { unique: true })
export class Image {
  @PrimaryColumn({ name: 'file_name' })
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

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date
}
