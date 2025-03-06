import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Category } from '@/model/Category'
import { TreeRepository } from 'typeorm'

@Injectable()
export class CategoryRepository extends TreeRepository<Category> {
  constructor() {
    super(Category, AppDataSource.manager)
  }

  async findById(id: string) {
    return this.findOne({ where: { id } })
  }

  async existByName(name: string) {
    return this.existsBy({ name })
  }

  async findAll(depth: number = 1) {
    return this.findTrees({ depth: depth - 1 })
  }

  async findBySlug(slug: string) {
    const category = await this.findOneBy({ slug })
    if (!category) return null
    return this.findDescendantsTree(category)
  }
}
