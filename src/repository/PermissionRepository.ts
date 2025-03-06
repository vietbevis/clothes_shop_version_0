import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Permission } from '@/model/Permisstion'
import { Repository } from 'typeorm'

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  constructor() {
    super(Permission, AppDataSource.manager)
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.findOne({ where: { name } })
  }
}
