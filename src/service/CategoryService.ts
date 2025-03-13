import { CreateCategoryType, UpdateCategoryType } from '@/validation/CategorySchema'
import { CategoryRepository } from '@/repository/CategoryRepository'
import { generateSlug, omitFields } from '@/utils/helper'
import { BadRequestError, EntityError, ValidationError } from '@/core/ErrorResponse'
import { Request } from 'express'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { Like } from 'typeorm'
import { Injectable } from '@/decorators/inject'
import { CategoryDTO, PaginateCategoryDTO } from '@/dtos/CategoryDTO'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategoies(name: string, parentId: string, req: Request) {
    const options = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    const result = await PaginationUtils.paginate(this.categoryRepository, options, {
      name: name ? Like(`%${name}%`) : undefined,
      parent: { id: parentId ?? undefined },
      level: parentId ? undefined : 1
    })
    return PaginateCategoryDTO.parse(result)
  }

  async getCategoryBySlug(slug: string) {
    const result = await this.categoryRepository.findBySlug(slug)
    if (!result) throw new BadRequestError('Category not found')
    return CategoryDTO.parse(result)
  }

  async create(body: CreateCategoryType) {
    try {
      const { name, parentId, image, description } = body

      const newCategory = this.categoryRepository.create({
        name,
        description: description ?? '',
        slug: generateSlug(name),
        parent: null
      })

      newCategory.imageUrl = image ?? ''

      if (parentId) {
        const parentCategory = await this.categoryRepository.findById(parentId)
        if (!parentCategory) throw new BadRequestError('Parent category not found')

        if (parentCategory.level === 5) throw new BadRequestError('Category level exceeded (max 5 levels)')

        newCategory.parent = parentCategory
        newCategory.level = parentCategory.level + 1
      }

      const result = await this.categoryRepository.save(newCategory)

      return CategoryDTO.parse(result)
    } catch (error) {
      throw new ValidationError('Category already exists', [new EntityError('name', 'Category already exists')])
    }
  }

  async update(id: string, body: UpdateCategoryType) {
    try {
      const category = await this.categoryRepository.findById(id)
      if (!category) throw new BadRequestError('Category not found')

      const { name, image, description } = body

      if (name !== category.name) {
        category.name = name
        category.slug = generateSlug(name)
      }

      category.description = description ?? ''
      category.imageUrl = image ?? ''

      const result = await this.categoryRepository.save(category)

      return CategoryDTO.parse(result)
    } catch (error) {
      throw new ValidationError('Category already exists', [new EntityError('name', 'Category already exists')])
    }
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findById(id)
    if (!category) throw new BadRequestError('Category not found')

    await this.categoryRepository.softRemove(category)
    return true
  }
}
