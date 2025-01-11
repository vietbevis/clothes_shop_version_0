import { Request } from 'express'
import { FindOptionsRelations, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm'

export type SortDirection = 'ASC' | 'DESC'

export interface PaginationOptions<T> {
  page?: number
  limit?: number
  sortBy?: keyof T
  sortDirection?: SortDirection
}

export interface PaginatedResult<T> {
  items: T[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    sortBy: keyof T | null
    sortDirection: SortDirection | null
  }
}

export class PaginationUtils {
  private static readonly DEFAULT_PAGE = 1
  private static readonly DEFAULT_PAGE_SIZE = 24
  private static readonly MAX_PAGE_SIZE = 100

  /**
   * Extract and validate pagination options from request query parameters
   */
  static extractPaginationOptions<T>(req: Request, defaultSort?: keyof T): PaginationOptions<T> {
    const page = Math.max(1, parseInt(req.query.page as string) || this.DEFAULT_PAGE)
    const limit = Math.min(
      this.MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.limit as string) || this.DEFAULT_PAGE_SIZE)
    )
    const sortBy = ((req.query.sortBy as string) || defaultSort) as keyof T
    const sortDirection = ((req.query.sortDirection as string)?.toUpperCase() || 'ASC') as SortDirection

    return {
      page,
      limit,
      sortBy,
      sortDirection: ['ASC', 'DESC'].includes(sortDirection) ? sortDirection : 'ASC'
    }
  }

  /**
   * Create a paginated query using TypeORM Repository
   */
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: PaginationOptions<T>,
    whereConditions: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>
  ): Promise<PaginatedResult<T>> {
    const { page = this.DEFAULT_PAGE, limit = this.DEFAULT_PAGE_SIZE, sortBy, sortDirection = 'ASC' } = options

    const skip = (page - 1) * limit
    const order: any = sortBy ? { [sortBy]: sortDirection } : {}

    const [items, totalItems] = await repository.findAndCount({
      where: whereConditions,
      relations,
      order,
      skip,
      take: limit
    })

    return this.createPaginatedResponse(items, totalItems, options)
  }

  private static createPaginatedResponse<T>(
    items: T[],
    totalItems: number,
    options: PaginationOptions<T>
  ): PaginatedResult<T> {
    const { page = this.DEFAULT_PAGE, limit = this.DEFAULT_PAGE_SIZE, sortBy, sortDirection = 'ASC' } = options

    const totalPages = Math.ceil(totalItems / limit)

    return {
      items,
      meta: {
        currentPage: page,
        limit: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sortBy: sortBy || null,
        sortDirection: sortDirection || null
      }
    }
  }
}
