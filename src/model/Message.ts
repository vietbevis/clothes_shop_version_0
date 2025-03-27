import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { AbstractModel } from './base/AbstractModel'
import { MessageStatus } from '@/utils/enums'
import { User } from './User'

@Entity('tbl_message')
export class Message extends AbstractModel {
  @Column({ type: 'text', nullable: false })
  content!: string

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT })
  status!: MessageStatus

  @Column({ name: 'sender_id', nullable: false })
  senderId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User

  @Column({ name: 'receiver_id', nullable: false })
  receiverId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver!: User

  @Column({ type: 'json', nullable: true })
  images!: string[]
}
