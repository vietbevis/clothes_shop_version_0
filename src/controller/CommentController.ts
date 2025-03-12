import { OkResponse } from '@/core/SuccessResponse'
import { Injectable } from '@/decorators/inject'
import { CommentService } from '@/service/CommentService'
import { Request, Response } from 'express'

@Injectable()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  async getCommentByProductSlug(req: Request, res: Response) {
    const { slug } = req.params
    const result = await this.commentService.getCommentByProductSlug(slug, req)
    new OkResponse('Comment found', result).send(res)
  }

  async getCommentReplies(req: Request, res: Response) {
    const { id } = req.params
    const result = await this.commentService.getCommentReplies(id, req)
    new OkResponse('Comment replies found', result).send(res)
  }

  async createComment(req: Request, res: Response) {
    const userId = req.user.payload.id
    const userEmail = req.user.sub
    const result = await this.commentService.createComment(userId, userEmail, req.body)
    new OkResponse('Comment created', result).send(res)
  }

  async updateComment(req: Request, res: Response) {
    const userId = req.user.payload.id
    const { id } = req.params
    const userEmail = req.user.sub
    const result = await this.commentService.updateComment(userId, userEmail, id, req.body)
    new OkResponse('Comment updated', result).send(res)
  }

  async deleteComment(req: Request, res: Response) {
    const userId = req.user.payload.id
    const { id } = req.params
    await this.commentService.deleteComment(userId, id)
    new OkResponse('Comment deleted').send(res)
  }
}
