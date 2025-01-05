import { AppDataSource } from '@/config/database'
import { Permission } from '@/model/Permisstion'

export const PermissionRepository = AppDataSource.getRepository(Permission).extend({
  async findByName(name: string): Promise<Permission | null> {
    return this.findOne({ where: { name } })
  }
})
