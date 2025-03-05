import { BeforeInsert, CreateDateColumn, DeleteDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { v7 } from 'uuid'

export abstract class AbstractModel {
  @PrimaryColumn('uuid', { name: 'id' })
  id!: string

  @CreateDateColumn({ name: 'created_at', type: 'datetime', hstoreType: 'string' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', hstoreType: 'string' })
  updatedAt!: Date

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', hstoreType: 'string', default: null, select: false })
  deletedAt!: Date | null

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = v7()
    }
  }
}
