import { BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { v7 } from 'uuid'

export abstract class AbstractModel {
  @PrimaryColumn('uuid', { name: 'id' })
  id!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = v7()
    }
  }
}
