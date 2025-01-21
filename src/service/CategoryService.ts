import { CreateCategoryType, UpdateCategoryType } from '@/validation/CategorySchema'
import CategoryRepository from '@/repository/CategoryRepository'
import { getSlug, omitFields } from '@/utils/helper'
import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import ImageRepository from '@/repository/ImageRepository'
import { User } from '@/model/User'
import { Request } from 'express'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { Like } from 'typeorm'

class CategoryService {
  async getCategories(name: string, parentId: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    const paginatedProducts = await PaginationUtils.paginate(
      CategoryRepository,
      paginationOptions,
      {
        name: name ? Like(`%${name}%`) : undefined,
        parent: { id: parentId ?? undefined }
      },
      { image: true }
    )
    return omitFields(paginatedProducts)
  }

  async getCategoryBySlug(slug: string) {
    const result = await CategoryRepository.findBySlug(slug)
    if (!result) throw new BadRequestError('Category not found')
    return omitFields(result, ['children'])
  }

  async create(body: CreateCategoryType, user: User | null) {
    if (!user) throw new UnauthorizedError()

    const { name, parentId, imageFilename, description } = body

    const existingCategory = await CategoryRepository.existByName(name)
    if (existingCategory) throw new BadRequestError('Category already exists')

    const newCategory = CategoryRepository.create({
      name,
      description: description ?? '',
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

  async update(id: string, body: UpdateCategoryType, user: User | null) {
    if (!user) throw new UnauthorizedError()

    const category = await CategoryRepository.findById(id)
    if (!category) throw new BadRequestError('Category not found')

    const { name, imageFilename, description } = body

    if (name !== category.name) {
      const existingCategory = await CategoryRepository.existByName(name)
      if (existingCategory) throw new BadRequestError('Category already exists')
    }

    category.name = name
    category.description = description ?? ''
    category.slug = getSlug(name)

    if (imageFilename) {
      const image = await ImageRepository.findByFileNameAndUserId(imageFilename, user.id)
      if (!image) throw new BadRequestError('Image not found')
      category.image = image
    } else {
      category.image = null
    }

    return CategoryRepository.save(category)
  }

  async delete(id: string) {
    const category = await CategoryRepository.findById(id)
    if (!category) throw new BadRequestError('Category not found')

    await CategoryRepository.remove(category)
  }
}

const categoryService = new CategoryService()
export default categoryService
