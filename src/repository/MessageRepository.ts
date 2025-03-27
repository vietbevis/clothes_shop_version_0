import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Message } from '@/model/Message'
import { Repository } from 'typeorm'

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor() {
    super(Message, AppDataSource.manager)
  }
}
