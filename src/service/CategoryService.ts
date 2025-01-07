import { CreateCategoryType } from '@/validation/CategorySchema'
import CategoryRepository from '@/repository/CategoryRepository'
import { getSlug } from '@/utils/helper'
import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import ImageRepository from '@/repository/ImageRepository'
import { User } from '@/model/User'

class CategoryService {
  async create(body: CreateCategoryType, user: User | null) {
    if (!user) throw new UnauthorizedError()

    const { name, parentId, imageFilename } = body

    const existingCategory = await CategoryRepository.existByName(name)
    if (existingCategory) throw new BadRequestError('Category already exists')

    const newCategory = CategoryRepository.create({
      name,
      slug: getSlug(name),
      image: null,
      parent: null
    })

    if (imageFilename) {
      const image = await ImageRepository.findByFileNameAndUserId(imageFilename, user.id)
      if (!image) throw new BadRequestError('Image not found')
      newCategory.image = image
    }

    if (parentId) {
      const parentCategory = await CategoryRepository.findById(parentId)
      if (!parentCategory) throw new BadRequestError('Parent category not found')

      if (parentCategory.level === 5) throw new BadRequestError('Category level exceeded (max 5 levels)')

      newCategory.parent = parentCategory
      newCategory.level = parentCategory.level + 1
    }

    return CategoryRepository.save(newCategory)
  }
}

const categoryService = new CategoryService()
export default categoryService
