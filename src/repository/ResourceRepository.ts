import { Resource } from '@/model/Resource'
import { AppDataSource } from '@/config/database'

export const ResourceRepository = AppDataSource.getRepository(Resource).extend({
  async findByName(name: string): Promise<Resource | null> {
    return this.findOne({ where: { name } })
  },
  async findById(id: string): Promise<Resource | null> {
    return this.findOne({ where: { id } })
  }
})
