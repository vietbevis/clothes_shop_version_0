import { AppDataSource } from '@/config/database'

const CommentRepository = AppDataSource.getTreeRepository(Comment).extend({})

export default CommentRepository
