import { BadRequestError } from '@/core/ErrorResponse'
import { Request } from 'express'
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder
} from 'typeorm'

export type SortDirection = 'ASC' | 'DESC'

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string[]
  sortDirection?: SortDirection[]
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
    sortBy: string[] | null
    sortDirection: SortDirection[] | null
  }
}

export class PaginationUtils {
  private static readonly DEFAULT_PAGE = 1
  private static readonly DEFAULT_PAGE_SIZE = 24
  private static readonly MAX_PAGE_SIZE = 100

  /**
   * Extract and validate pagination options from query parameters
   * @param req Express Request object
   * @param defaultSortBy Default sort fields (comma-separated string or array, e.g. "createdAt,id" or ["createdAt", "id"])
   * @param defaultSortDirection Default sort directions (comma-separated string or array, e.g. "DESC,ASC" or ["DESC", "ASC"])
   * @returns PaginationOptions
   */
  static extractPaginationOptions(
    req: Request,
    defaultSortBy?: string | string[],
    defaultSortDirection?: string | SortDirection[]
  ): PaginationOptions {
    const page = Math.max(1, parseInt(String(req.query.page)) || this.DEFAULT_PAGE)
    const limit = Math.min(this.MAX_PAGE_SIZE, Math.max(1, parseInt(String(req.query.limit)) || this.DEFAULT_PAGE_SIZE))

    // Handle sortBy
    const sortBy = this.parseSortParameter(req.query.sortBy, defaultSortBy)

    // Handle sortDirection
    const sortDirections = this.parseSortDirectionParameter(req.query.sortDirection, defaultSortDirection)

    // Match sortDirection length with sortBy length
    const finalSortDirections: SortDirection[] = this.normalizeSortDirections(sortBy, sortDirections)

    return {
      page,
      limit,
      sortBy: sortBy.length ? sortBy : undefined,
      sortDirection: finalSortDirections.length ? finalSortDirections : undefined
    }
  }

  /**
   * Parse sort parameter from request query
   */
  private static parseSortParameter(sortParam: unknown, defaultSort?: string | string[]): string[] {
    if (Array.isArray(sortParam)) {
      return sortParam
        .filter((field): field is string => typeof field === 'string')
        .map((field) => field.trim())
        .filter(Boolean)
    }

    if (typeof sortParam === 'string') {
      return sortParam
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean)
    }

    // Handle default sort
    if (Array.isArray(defaultSort)) {
      return defaultSort.filter(Boolean)
    }

    if (typeof defaultSort === 'string') {
      return defaultSort
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean)
    }

    return []
  }

  /**
   * Parse sort direction parameter from request query
   */
  private static parseSortDirectionParameter(
    directionParam: unknown,
    defaultDirection?: string | SortDirection[]
  ): SortDirection[] {
    if (Array.isArray(directionParam)) {
      return directionParam
        .filter((dir): dir is string => typeof dir === 'string')
        .map((dir) => dir.toUpperCase().trim())
        .filter((dir) => ['ASC', 'DESC'].includes(dir)) as SortDirection[]
    }

    if (typeof directionParam === 'string') {
      return directionParam
        .toUpperCase()
        .split(',')
        .map((dir) => dir.trim())
        .filter(Boolean)
        .map((dir) => (['ASC', 'DESC'].includes(dir) ? dir : 'DESC')) as SortDirection[]
    }

    // Handle default sort direction
    if (Array.isArray(defaultDirection)) {
      return defaultDirection.filter(
        (dir): dir is SortDirection => typeof dir === 'string' && ['ASC', 'DESC'].includes(dir)
      )
    }

    if (typeof defaultDirection === 'string') {
      return defaultDirection
        .toUpperCase()
        .split(',')
        .map((dir) => dir.trim())
        .filter(Boolean)
        .map((dir) => (['ASC', 'DESC'].includes(dir) ? dir : 'DESC')) as SortDirection[]
    }

    return []
  }

  /**
   * Match sort directions array length with sort fields array length
   */
  private static normalizeSortDirections(sortBy: string[], sortDirections: SortDirection[]): SortDirection[] {
    return sortBy.map((_, index) => {
      if (index < sortDirections.length) {
        return sortDirections[index]
      } else if (sortDirections.length > 0) {
        return sortDirections[sortDirections.length - 1]
      }
      return 'DESC'
    })
  }

  /**
   * Paginate using TypeORM Repository
   * @param repository TypeORM Repository
   * @param options Pagination options
   * @param whereConditions Filter conditions
   * @param relations Relations to load
   * @param select Fields to select
   * @param cache Cache options (boolean or milliseconds)
   * @returns Promise<PaginatedResult<T>>
   */
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: PaginationOptions,
    whereConditions: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    relations?: FindOptionsRelations<T>,
    select?: FindOptionsSelect<T>,
    cache?: boolean | number
  ): Promise<PaginatedResult<T>> {
    const { page = this.DEFAULT_PAGE, limit = this.DEFAULT_PAGE_SIZE, sortBy, sortDirection } = options
    const skip = (page - 1) * limit

    try {
      // Build order object
      const order = this.buildOrder(repository, sortBy, sortDirection)

      // Get items and count in a single query to improve performance
      const [items, totalItems] = await repository.findAndCount({
        where: whereConditions,
        relations,
        order,
        skip,
        take: limit,
        select,
        cache
      })

      return this.createPaginatedResponse(items, totalItems, options)
    } catch (error) {
      throw error instanceof BadRequestError
        ? error
        : new BadRequestError(`Pagination error: ${(error as Error).message}`)
    }
  }

  /**
   * Paginate using TypeORM QueryBuilder
   * @param queryBuilder TypeORM SelectQueryBuilder
   * @param options Pagination options
   * @returns Promise<PaginatedResult<T>>
   */
  static async paginateWithQueryBuilder<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const { page = this.DEFAULT_PAGE, limit = this.DEFAULT_PAGE_SIZE, sortBy, sortDirection } = options
    const skip = (page - 1) * limit

    try {
      // Add count query to optimize for MySQL
      const countQueryBuilder = queryBuilder.clone()

      // Apply sorting
      if (sortBy?.length) {
        sortBy.forEach((field, index) => {
          const direction = sortDirection?.[index] || 'DESC'
          // For MySQL optimization, use direct column references when possible
          queryBuilder.addOrderBy(field, direction)
        })
      }

      // Get total count with optimized query (without ordering)
      const totalItems = await countQueryBuilder.skip(undefined).take(undefined).orderBy().getCount()

      // Get items with pagination
      const items = await queryBuilder.skip(skip).take(limit).getMany()

      return this.createPaginatedResponse(items, totalItems, options)
    } catch (error) {
      throw error instanceof BadRequestError
        ? error
        : new BadRequestError(`Pagination error: ${(error as Error).message}`)
    }
  }

  /**
   * Build order object for TypeORM from sort fields
   * @param repository TypeORM Repository
   * @param sortBy List of sort fields
   * @param sortDirection List of sort directions
   * @returns Order object
   */
  private static buildOrder<T extends ObjectLiteral>(
    repository: Repository<T>,
    sortBy?: string[],
    sortDirection?: SortDirection[]
  ): Record<string, any> {
    const order: Record<string, any> = {}
    if (!sortBy?.length) return order

    // Create a fields map for faster validation
    const validFields = new Set(repository.metadata.columns.map((column) => column.propertyPath))

    sortBy.forEach((field, index) => {
      // For nested fields, check if the base relation exists
      const basePath = field.split('.')[0]
      if (!validFields.has(field) && !repository.metadata.relations.some((r) => r.propertyName === basePath)) {
        throw new BadRequestError(`Invalid sort field: ${field}`)
      }

      const direction = sortDirection?.[index] || 'DESC'
      this.mergeOrder(order, this.buildNestedOrder(field, direction))
    })

    return order
  }

  /**
   * Build nested order object for relation fields
   * @param field Field name (supports "relation.field" format)
   * @param direction Sort direction
   * @returns Nested order object
   */
  private static buildNestedOrder(field: string, direction: SortDirection): Record<string, any> {
    const parts = field.split('.')
    const result: Record<string, any> = {}
    let current = result

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      current[part] = isLast ? direction : {}
      if (!isLast) {
        current = current[part]
      }
    }

    return result
  }

  /**
   * Merge order objects
   * @param target Target object
   * @param source Source object
   */
  private static mergeOrder(target: Record<string, any>, source: Record<string, any>): void {
    for (const key of Object.keys(source)) {
      if (typeof source[key] === 'object' && key in target) {
        this.mergeOrder(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }

  /**
   * Create standardized pagination response
   * @param items List of items
   * @param totalItems Total number of items
   * @param options Pagination options
   * @returns PaginatedResult<T>
   */
  private static createPaginatedResponse<T>(
    items: T[],
    totalItems: number,
    options: PaginationOptions
  ): PaginatedResult<T> {
    const { page = this.DEFAULT_PAGE, limit = this.DEFAULT_PAGE_SIZE, sortBy, sortDirection } = options
    const totalPages = Math.max(1, Math.ceil(totalItems / limit))

    return {
      items,
      meta: {
        currentPage: page,
        limit,
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
