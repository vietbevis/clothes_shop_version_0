import { AppDataSource } from '@/config/database'
import { Category } from '@/model/Category'

const CategoryRepository = AppDataSource.getTreeRepository(Category).extend({
  async findById(id: string) {
    return this.findOne({ where: { id } })
  },
  async existByName(name: string) {
    return this.existsBy({ name })
  }
})

export default CategoryRepository
