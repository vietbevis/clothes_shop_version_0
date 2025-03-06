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
   * Trích xuất và xác thực các tùy chọn phân trang từ query parameters.
   * @param req Request object từ Express
   * @param defaultSort Trường sắp xếp mặc định (chuỗi phân cách bằng dấu phẩy, ví dụ: "createdAt, id")
   * @returns PaginationOptions
   */
  static extractPaginationOptions(req: Request, defaultSort?: string): PaginationOptions {
    const page = Math.max(1, parseInt(req.query.page as string) || this.DEFAULT_PAGE)
    const limit = Math.min(
      this.MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.limit as string) || this.DEFAULT_PAGE_SIZE)
    )

    // Xử lý sortBy
    let sortBy: string[]
    if (Array.isArray(req.query.sortBy)) {
      sortBy = req.query.sortBy
        .filter((field): field is string => typeof field === 'string')
        .map((field) => field.trim())
        .filter((field) => field !== '')
    } else if (typeof req.query.sortBy === 'string') {
      sortBy = req.query.sortBy
        .split(',')
        .map((field) => field.trim())
        .filter((field) => field !== '')
    } else {
      sortBy = defaultSort
        ? defaultSort
            .split(',')
            .map((field) => field.trim())
            .filter((field) => field !== '')
        : []
    }

    // Xử lý sortDirection
    let sortDirections: SortDirection[]
    if (Array.isArray(req.query.sortDirection)) {
      sortDirections = req.query.sortDirection
        .filter((dir): dir is string => typeof dir === 'string')
        .map((dir) => dir.toUpperCase().trim())
        .filter((dir) => ['ASC', 'DESC'].includes(dir)) as SortDirection[]
    } else if (typeof req.query.sortDirection === 'string') {
      sortDirections = req.query.sortDirection
        .toUpperCase()
        .split(',')
        .map((dir) => dir.trim())
        .filter((dir) => dir !== '')
        .map((dir) => (['ASC', 'DESC'].includes(dir) ? dir : 'DESC')) as SortDirection[]
    } else {
      sortDirections = []
    }

    // Đồng bộ sortDirection với sortBy
    const finalSortDirections: SortDirection[] = sortBy.map((_, index) => {
      if (index < sortDirections.length) {
        return sortDirections[index]
      } else if (sortDirections.length > 0) {
        return sortDirections[sortDirections.length - 1]
      }
      return 'DESC'
    })

    return {
      page,
      limit,
      sortBy: sortBy.length ? sortBy : undefined,
      sortDirection: finalSortDirections.length ? finalSortDirections : undefined
    }
  }

  /**
   * Thực hiện phân trang bằng Repository của TypeORM.
   * @param repository TypeORM Repository
   * @param options Tùy chọn phân trang
   * @param whereConditions Điều kiện lọc dữ liệu
   * @param relations Các quan hệ cần tải
   * @param select Các trường cần chọn
   * @param cache Tùy chọn cache (boolean hoặc số mili giây)
   * @returns Promise<PaginatedResult<T>>
   */
  static async paginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    options: PaginationOptions,
    whereConditions: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
    select?: FindOptionsSelect<T>,
    cache?: boolean | number
  ): Promise<PaginatedResult<T>> {
    const { page = this.DEFAULT_PAGE, limit = this.DEFAULT_PAGE_SIZE, sortBy, sortDirection } = options
    const skip = (page - 1) * limit

    const order = this.buildOrder(repository, sortBy, sortDirection)

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
  }

  /**
   * Thực hiện phân trang bằng QueryBuilder của TypeORM.
   * @param queryBuilder TypeORM SelectQueryBuilder
   * @param options Tùy chọn phân trang
   * @returns Promise<PaginatedResult<T>>
   */
  static async paginateWithQueryBuilder<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const { page = this.DEFAULT_PAGE, limit = this.DEFAULT_PAGE_SIZE, sortBy, sortDirection } = options
    const skip = (page - 1) * limit

    if (sortBy) {
      sortBy.forEach((field, index) => {
        const direction = sortDirection?.[index] || 'DESC'
        queryBuilder.addOrderBy(field, direction)
      })
    }

    const [items, totalItems] = await queryBuilder.skip(skip).take(limit).getManyAndCount()

    return this.createPaginatedResponse(items, totalItems, options)
  }

  /**
   * Xây dựng đối tượng order cho TypeORM từ các trường sắp xếp.
   * @param repository TypeORM Repository
   * @param sortBy Danh sách trường sắp xếp
   * @param sortDirection Danh sách hướng sắp xếp
   * @returns Đối tượng order
   */
  private static buildOrder<T extends ObjectLiteral>(
    repository: Repository<T>,
    sortBy?: string[],
    sortDirection?: SortDirection[]
  ): any {
    const order: any = {}
    if (!sortBy) return order

    sortBy.forEach((field, index) => {
      if (!this.isValidSortField(repository, field)) {
        throw new BadRequestError(`Trường sắp xếp không hợp lệ: ${field}`)
      }
      const direction = sortDirection?.[index] || 'DESC'
      this.mergeOrder(order, this.buildNestedOrder(field, direction))
    })

    return order
  }

  /**
   * Kiểm tra xem trường sắp xếp có hợp lệ trong metadata của entity không.
   * @param repository TypeORM Repository
   * @param field Trường cần kiểm tra
   * @returns boolean
   */
  private static isValidSortField<T extends ObjectLiteral>(repository: Repository<T>, field: string): boolean {
    return !!repository.metadata.findColumnWithPropertyPath(field)
  }

  /**
   * Xây dựng đối tượng order lồng nhau cho các trường quan hệ.
   * @param field Tên trường (hỗ trợ định dạng "relation.field")
   * @param direction Hướng sắp xếp
   * @returns Đối tượng order lồng nhau
   */
  private static buildNestedOrder(field: string, direction: SortDirection): any {
    const parts = field.split('.')
    const result: any = {}
    let current = result

    parts.forEach((part, index) => {
      current[part] = index === parts.length - 1 ? direction : {}
      current = current[part]
    })

    return result
  }

  /**
   * Hợp nhất các đối tượng order.
   * @param target Đối tượng đích
   * @param source Đối tượng nguồn
   */
  private static mergeOrder(target: any, source: any): void {
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && key in target) {
        this.mergeOrder(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }

  /**
   * Tạo response phân trang chuẩn hóa.
   * @param items Danh sách mục
   * @param totalItems Tổng số mục
   * @param options Tùy chọn phân trang
   * @returns PaginatedResult<T>
   */
  private static createPaginatedResponse<T>(
    items: T[],
    totalItems: number,
    options: PaginationOptions
  ): PaginatedResult<T> {
    const { page = this.DEFAULT_PAGE, limit = this.DEFAULT_PAGE_SIZE, sortBy, sortDirection } = options
    const totalPages = Math.ceil(totalItems / limit)

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
