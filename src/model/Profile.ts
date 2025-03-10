import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { User } from './User'
import { Gender } from '@/utils/enums'

@Entity('tbl_profile')
export class Profile {
  @PrimaryColumn({ name: 'user_id' })
  userId!: string

  @Column({ type: 'nvarchar', length: 70, nullable: false })
  fullName!: string

  @Column({ type: 'varchar', name: 'avatar_url', default: '' })
  avatarUrl!: string

  @Column({ type: 'varchar', name: 'cover_photo_url', default: '' })
  coverPhotoUrl!: string

  @Column({ name: 'gender', type: 'enum', enum: Gender, default: Gender.OTHER })
  gender!: Gender

  @Column({ name: 'dob', type: 'date', nullable: true })
  dateOfBirth!: Date

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio!: string

  @Column({ name: 'phone', type: 'varchar', length: 10, default: '' })
  phone!: string

  @Column({ name: 'website', type: 'varchar', default: '' })
  website!: string

  @Column({ name: 'facebook_url', type: 'varchar', default: '' })
  facebookUrl!: string

  @Column({ name: 'twitter_url', type: 'varchar', default: '' })
  twitterUrl!: string

  @Column({ name: 'instagram_url', type: 'varchar', default: '' })
  instagramUrl!: string

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user!: User
}
