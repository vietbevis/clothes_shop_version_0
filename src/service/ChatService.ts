import { BadRequestError } from '@/core/ErrorResponse'
import { Injectable } from '@/decorators/inject'
import { PaginationUtils } from '@/utils/PaginationUtils'
import type { CreateMessageType, UpdateMessageType } from '@/validation/MessageSchema'
import type { Request } from 'express'
import { MessageEventType, MessageStatus } from '@/utils/enums'
import { logInfo } from '@/utils/log'
import { MessageRepository } from '@/repository/MessageRepository'
import { KafkaService } from './KafkaService'
import { UserRepository } from '@/repository/UserRepository'
import { In } from 'typeorm'
import { ConversationRepository } from '@/repository/ConversationRepository'

@Injectable()
export class ChatService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly userRepository: UserRepository,
    private readonly kafkaService: KafkaService
  ) {}

  async getMessages(userId: string, partnerId: string, req: Request) {
    const options = PaginationUtils.extractPaginationOptions(req, 'createdAt', 'DESC')

    const paginatedMessages = await PaginationUtils.paginate(
      this.messageRepository,
      options,
      [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ],
      {
        sender: true,
        receiver: true
      },
      {
        id: true,
        content: true,
        images: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        sender: {
          id: true,
          fullName: true,
          avatarUrl: true
        },
        receiver: {
          id: true,
          fullName: true,
          avatarUrl: true
        }
      }
    )

    return paginatedMessages
  }

  async createMessage(senderId: string, data: CreateMessageType) {
    // Kiểm tra người nhận có tồn tại không
    const receiver = await this.userRepository.existsBy({ id: data.receiverId })
    if (!receiver) throw new BadRequestError('Receiver not found')

    const message = this.messageRepository.create({
      content: data.content,
      senderId,
      receiverId: data.receiverId,
      images: data.images || [],
      status: MessageStatus.SENT
    })

    const savedMessage = await this.messageRepository.save(message)

    await this.markMessagesAsRead(senderId, data.receiverId)

    const selectMessage = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: {
        sender: true,
        receiver: true
      },
      select: {
        id: true,
        content: true,
        images: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        sender: {
          id: true,
          fullName: true,
          avatarUrl: true
        },
        receiver: {
          id: true,
          fullName: true,
          avatarUrl: true
        }
      }
    })

    if (!selectMessage) throw new BadRequestError('Message not found')

    logInfo(`Sending message from ${senderId} to ${data.receiverId}`)

    // Gửi tin nhắn qua Kafka để xử lý real-time
    await this.kafkaService.sendMessage({
      ...selectMessage,
      eventType: MessageEventType.MESSAGE_CREATED
    })

    return selectMessage
  }

  async updateMessage(userId: string, messageId: string, data: UpdateMessageType) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: {
        sender: true,
        receiver: true
      }
    })

    if (!message || message.senderId !== userId)
      throw new BadRequestError('Message not found or you do not have permission to edit it')

    // Cập nhật tin nhắn
    const updatedMessage = await this.messageRepository.save({
      ...message,
      ...data
    })

    logInfo(`Updating message from ${userId} to ${message.receiverId}`)

    // Gửi thông báo qua Kafka
    await this.kafkaService.sendMessage({
      ...updatedMessage,
      eventType: MessageEventType.MESSAGE_UPDATED
    })

    return updatedMessage
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.messageRepository.findOneBy({ id: messageId })

    if (!message || message.senderId !== userId)
      throw new BadRequestError('Message not found or you do not have permission to delete it')

    try {
      await this.messageRepository.delete({ id: messageId })

      logInfo(`Deleting message from ${userId} to ${message.receiverId}`)

      // Gửi thông báo qua Kafka
      await this.kafkaService.sendMessage({
        messageId,
        senderId: userId,
        receiverId: message.receiverId,
        eventType: MessageEventType.MESSAGE_DELETED
      })

      return true
    } catch (error) {
      throw new BadRequestError('Failed to delete message')
    }
  }

  // Get all conversations for a user
  async getConversations(userId: string, req: Request) {
    // Get all conversations with the latest message
    const searchName = req.query?.search as string
    const conversations = await this.conversationRepository.getUserConversations(userId, req, searchName)

    return conversations
  }

  // Mark messages as read
  async markMessagesAsRead(userId: string, partnerId: string) {
    // Find all unread messages from partner to user
    const unreadMessages = await this.messageRepository.find({
      where: {
        senderId: partnerId,
        receiverId: userId,
        status: MessageStatus.SENT
      }
    })

    if (unreadMessages.length === 0) {
      return { count: 0 }
    }

    // Update all messages to read status
    await this.messageRepository.update(
      {
        id: In(unreadMessages.map((m) => m.id))
      },
      {
        status: MessageStatus.READ
      }
    )

    return { count: unreadMessages.length }
  }
}
