import { CreateCategoryType, UpdateCategoryType } from '@/validation/CategorySchema'
import CategoryRepository from '@/repository/CategoryRepository'
import { generateSlug, omitFields } from '@/utils/helper'
import { BadRequestError, EntityError, ValidationError } from '@/core/ErrorResponse'
import ImageRepository from '@/repository/ImageRepository'
import { Request } from 'express'
import { PaginationUtils as PaginationUtilsV2 } from '@/utils/PaginationUtilsV2'
import { Like } from 'typeorm'
import { DecodedJwtToken } from './JwtService'

class CategoryService {
  async getCategoiesV2(name: string, parentId: string, req: Request) {
    const options = PaginationUtilsV2.extractPaginationOptions(req, 'createdAt')
    const result = await PaginationUtilsV2.paginate(CategoryRepository, options, {
      name: name ? Like(`%${name}%`) : undefined,
      parent: { id: parentId ?? undefined }
    })
    return omitFields(result)
  }

  async getCategoryBySlug(slug: string) {
    const result = await CategoryRepository.findBySlug(slug)
    if (!result) throw new BadRequestError('Category not found')
    return omitFields(result, ['children'])
  }

  async create(body: CreateCategoryType) {
    const { name, parentId, image, description } = body

    const existingCategory = await CategoryRepository.existByName(name)
    if (existingCategory) throw new BadRequestError('Category already exists')

    const newCategory = CategoryRepository.create({
      name,
      description: description ?? '',
      slug: generateSlug(name),
      parent: null
    })

    // if (image) {
    //   const imageExists = await ImageRepository.findByFileNameAndUserId(image, user.payload.id)
    //   if (!imageExists) throw new BadRequestError('Image not found')
    //   newCategory.image = imageExists
    // }

    newCategory.imageUrl = image ?? ''

    if (parentId) {
      const parentCategory = await CategoryRepository.findById(parentId)
      if (!parentCategory) throw new BadRequestError('Parent category not found')

      if (parentCategory.level === 5) throw new BadRequestError('Category level exceeded (max 5 levels)')

      newCategory.parent = parentCategory
      newCategory.level = parentCategory.level + 1
    }

    return omitFields(await CategoryRepository.save(newCategory), ['deletedAt', 'parent', 'children', 'image'])
  }

  async update(id: string, body: UpdateCategoryType) {
    try {
      const category = await CategoryRepository.findById(id)
      if (!category) throw new BadRequestError('Category not found')

      const { name, image, description } = body

      if (name !== category.name) {
        category.name = name
        category.slug = generateSlug(name)
      }

      category.description = description ?? ''
      category.imageUrl = image ?? ''

      return omitFields(await CategoryRepository.save(category), ['deletedAt', 'parent', 'children', 'image'])
    } catch (error) {
      throw new ValidationError('Category already exists', [new EntityError('name', 'Category already exists')])
    }
  }

  async delete(id: string) {
    const category = await CategoryRepository.findById(id)
    if (!category) throw new BadRequestError('Category not found')

    await CategoryRepository.softRemove(category)
  }
}

const categoryService = new CategoryService()
export default categoryService
