import { BadRequestError } from '@/core/ErrorResponse'
import { OkResponse } from '@/core/SuccessResponse'
import { Injectable } from '@/decorators/inject'
import { ChatService } from '@/service/ChatService'
import { Request, Response } from 'express'

@Injectable()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  async getConversations(req: Request, res: Response) {
    const result = await this.chatService.getConversations(req.user.payload.id, req)
    new OkResponse('Conversations', result).send(res)
  }

  async createMessage(req: Request, res: Response) {
    const result = await this.chatService.createMessage(req.user.payload.id, req.body)
    new OkResponse('Message created', result).send(res)
  }

  async getMessages(req: Request, res: Response) {
    const partnerId = req.params?.id
    const result = await this.chatService.getMessages(req.user.payload.id, partnerId, req)
    new OkResponse('Messages', result).send(res)
  }

  async updateMessage(req: Request, res: Response) {
    const messageId = req.params?.id
    const result = await this.chatService.updateMessage(req.user.payload.id, messageId, req.body)
    new OkResponse('Message updated', result).send(res)
  }

  async deleteMessage(req: Request, res: Response) {
    const messageId = req.params?.id
    await this.chatService.deleteMessage(req.user.payload.id, messageId)
    new OkResponse('Message deleted').send(res)
  }

  async readMessages(req: Request, res: Response) {
    const partnerId = req.params?.id
    await this.chatService.markMessagesAsRead(req.user.payload.id, partnerId)
    new OkResponse('Messages read').send(res)
  }
}
