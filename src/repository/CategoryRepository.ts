import { AppDataSource } from '@/config/database'
import { Category } from '@/model/Category'

const CategoryRepository = AppDataSource.getTreeRepository(Category).extend({
  async findById(id: string) {
    return this.findOne({ where: { id } })
  },
  async existByName(name: string) {
    return this.existsBy({ name })
  },
  async findAll(depth: number = 1) {
    return this.findTrees({ depth: depth - 1 })
  },
  async findBySlug(slug: string) {
    const category = await this.findOneBy({ slug })
    if (!category) return null
    return this.findDescendantsTree(category)
  }
})

export default CategoryRepository
