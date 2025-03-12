import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Comment } from '@/model/Comment'
import { TreeRepository } from 'typeorm'

@Injectable()
export class CommentRepository extends TreeRepository<Comment> {
  constructor() {
    super(Comment, AppDataSource.manager)
  }
}
