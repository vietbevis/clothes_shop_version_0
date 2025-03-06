import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Role } from '@/model/Role'
import { FindOptionsRelations, Repository } from 'typeorm'

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor() {
    super(Role, AppDataSource.manager)
  }

  async findByName(name: string, relations?: FindOptionsRelations<Role>): Promise<Role | null> {
    return this.findOne({ where: { name }, relations })
  }
}
