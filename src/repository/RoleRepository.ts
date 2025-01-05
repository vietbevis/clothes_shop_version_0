import { AppDataSource } from '@/config/database'
import { Role } from '@/model/Role'
import { FindOptionsRelations } from 'typeorm'

export const RoleRepository = AppDataSource.getRepository(Role).extend({
  async findByName(name: string, relations?: FindOptionsRelations<Role>): Promise<Role | null> {
    return this.findOne({ where: { name }, relations })
  }
})
