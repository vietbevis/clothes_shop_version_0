import { BadRequestError } from '@/core/ErrorResponse'
import { Injectable } from '@/decorators/inject'
import { CommentDTO, PaginateCommentDTO } from '@/dtos/CommentDTO'
import { Comment } from '@/model/Comment'
import { CommentRepository } from '@/repository/CommentRepository'
import { ProductRepository } from '@/repository/ProductRepository'
import { ProfileRepository } from '@/repository/ProfileRepository'
import { UserRepository } from '@/repository/UserRepository'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { CreateCommentType, UpdateCommentType } from '@/validation/CommentSchema'
import { Request } from 'express'

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async getCommentByProductSlug(slug: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    const commentPagination = await PaginationUtils.paginate(
      this.commentRepository,
      paginationOptions,
      { productSlug: slug, level: 1 },
      { user: true },
      {
        id: true,
        content: true,
        productSlug: true,
        userId: true,
        level: true,
        createdAt: true,
        updatedAt: true,
        user: { email: true, fullName: true, avatarUrl: true }
      }
    )

    const transformedItems = commentPagination.items.map((comment) =>
      this.transformComment(comment, req?.user?.payload?.id)
    )

    return PaginateCommentDTO.parse({
      ...commentPagination,
      items: transformedItems
    })
  }

  async getCommentReplies(commentId: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    const commentPagination = await PaginationUtils.paginate(
      this.commentRepository,
      paginationOptions,
      { parent: { id: commentId } },
      { user: true },
      {
        id: true,
        content: true,
        productSlug: true,
        level: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: { email: true, fullName: true, avatarUrl: true }
      }
    )

    const transformedItems = commentPagination.items.map((comment) =>
      this.transformComment(comment, req?.user?.payload?.id, commentId)
    )

    return PaginateCommentDTO.parse({
      ...commentPagination,
      items: transformedItems
    })
  }

  async createComment(userId: string, userEmail: string, body: CreateCommentType) {
    const { content, productSlug, parentId } = body

    const newComment = this.commentRepository.create({
      content,
      userId
    })

    const productExists = await this.productRepository.existsBy({ slug: productSlug })
    if (!productExists) throw new BadRequestError('Product not found')

    newComment.productSlug = productSlug

    let parentComment: Comment | null = null
    if (parentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: parentId },
        select: { level: true, id: true, productSlug: true }
      })
      if (!parentComment) throw new BadRequestError('Parent comment not found')

      newComment.parent = parentComment
      newComment.level = parentComment.level + 1
      newComment.productSlug = parentComment.productSlug
    }

    if (newComment.level > 3) throw new BadRequestError('Comment level must be less than 3')

    const [savedComment, profileUser] = await Promise.all([
      this.commentRepository.save(newComment),
      this.userRepository.findOne({
        where: { id: userId },
        select: { fullName: true, avatarUrl: true }
      })
    ])

    const transformedComment = this.transformComment(savedComment, userId, parentId, {
      id: userId,
      email: userEmail,
      fullName: profileUser?.fullName || '',
      avatarUrl: profileUser?.avatarUrl || ''
    })

    transformedComment.isAuthor = true
    return CommentDTO.parse(transformedComment)
  }

  async updateComment(userId: string, userEmail: string, commentId: string, body: UpdateCommentType) {
    const { content } = body

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: { user: true, parent: true },
      select: {
        id: true,
        content: true,
        level: true,
        productSlug: true,
        createdAt: true,
        updatedAt: true,
        user: { id: true, fullName: true, avatarUrl: true },
        parent: { id: true }
      }
    })
    if (!comment) throw new BadRequestError('Comment not found')
    if (comment.user.id !== userId) throw new BadRequestError('You are not the owner of this comment')

    comment.content = content

    const savedComment = await this.commentRepository.save(comment)

    const transformedComment = this.transformComment(savedComment, userId, comment.parent?.id || '', {
      id: userId,
      email: userEmail,
      fullName: comment.user.fullName,
      avatarUrl: comment.user.avatarUrl
    })
    transformedComment.isAuthor = true
    return CommentDTO.parse(transformedComment)
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentRepository.findOne({ where: { id: commentId }, relations: { user: true } })
    if (!comment) throw new BadRequestError('Comment not found')
    if (comment.user.id !== userId) throw new BadRequestError('You are not the owner of this comment')

    await this.commentRepository.softRemove(comment)
  }

  /**
   * Hàm chuyển đổi comment entity thành dạng DTO.
   * @param comment Entity comment cần chuyển đổi.
   * @param reqUserId ID của user đang thực hiện request.
   * @param fallbackParentId Nếu có, sẽ dùng làm parentId thay vì lấy từ comment.parent.
   * @param overrideAuthor Nếu cung cấp, sẽ ghi đè dữ liệu author.
   */
  private transformComment(
    comment: Comment,
    reqUserId: string | undefined,
    fallbackParentId?: string,
    overrideAuthor?: { id: string; email: string; fullName: string; avatarUrl: string }
  ): any {
    const parentId = fallbackParentId ?? comment.parent?.id ?? ''
    const author = overrideAuthor ?? {
      id: comment.userId,
      email: comment.user.email,
      fullName: comment.user.fullName,
      avatarUrl: comment.user.avatarUrl
    }
    return {
      ...comment,
      parentId,
      author,
      isAuthor: comment.userId === reqUserId,
      replyTo: null
    }
  }
}
