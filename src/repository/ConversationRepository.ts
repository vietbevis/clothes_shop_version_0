import { Injectable } from '@/decorators/inject'
import { Message } from '@/model/Message'
import { Repository } from 'typeorm'
import { AppDataSource } from '@/config/database'
import { MessageStatus } from '@/utils/enums'
import { Request } from 'express'
import { PaginationUtils } from '@/utils/PaginationUtils'

@Injectable()
export class ConversationRepository extends Repository<Message> {
  constructor() {
    super(Message, AppDataSource.manager)
  }

  /**
   * Get all conversations for a user with detailed information
   * A conversation is represented by the latest message between two users
   * @param userId User ID to get conversations for
   * @param searchName Optional search term to filter by partner name
   * @param page Page number for pagination
   * @param limit Number of conversations per page
   */
  async getUserConversations(userId: string, req: Request, searchName?: string) {
    const options = PaginationUtils.extractPaginationOptions(req, 'message.createdAt', 'DESC')

    // Base query to get the latest message IDs between users
    const latestMessagesQuery = this.createQueryBuilder('m')
      .select('MAX(m.id)', 'id')
      .where('m.sender_id = :userId OR m.receiver_id = :userId')
      .setParameter('userId', userId)
      .groupBy('LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)')

    // Main query to get conversations with details
    let conversationsQuery = this.createQueryBuilder('message')
      .select([
        'message.id',
        'message.content',
        'message.status',
        'message.createdAt',
        'message.images',
        'sender.id',
        'sender.fullName',
        'sender.avatarUrl',
        'receiver.id',
        'receiver.fullName',
        'receiver.avatarUrl'
      ])
      .innerJoin('message.sender', 'sender')
      .innerJoin('message.receiver', 'receiver')
      .where(`message.id IN (${latestMessagesQuery.getQuery()})`)
      .setParameter('userId', userId)

    // Add search filter if searchName is provided
    if (searchName && searchName.trim() !== '') {
      conversationsQuery = conversationsQuery
        .andWhere(
          '(sender.id != :userId AND sender.fullName LIKE :searchName) OR (receiver.id != :userId AND receiver.fullName LIKE :searchName)'
        )
        .setParameter('searchName', `%${searchName.trim()}%`)
    }

    const res = await PaginationUtils.paginateWithQueryBuilder(conversationsQuery, options)

    // Map to conversation DTO
    const conversationDTOs = await Promise.all(
      res.items.map(async (message) => {
        const partner = message.sender.id === userId ? message.receiver : message.sender

        return {
          id: partner.id,
          partnerId: partner.id,
          partnerName: partner.fullName,
          partnerAvatar: partner.avatarUrl,
          lastMessage: {
            id: message.id,
            content: message.content,
            sender: message.sender,
            receiver: message.receiver,
            status: message.status,
            createdAt: message.createdAt,
            images: message.images || []
          },
          // Fetch unread message count for this conversation
          unreadCount: await this.countUnreadMessages(userId, partner.id)
        }
      })
    )

    // Return with pagination metadata
    return {
      items: conversationDTOs,
      meta: res.meta
    }
  }

  /**
   * Retrieve full conversation messages between two users
   */
  async getConversationMessages(userId: string, partnerId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit

    const [messages, total] = await this.findAndCount({
      where: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
      relations: ['sender', 'receiver']
    })

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Count unread messages in a conversation
   */
  async countUnreadMessages(userId: string, partnerId: string): Promise<number> {
    return this.count({
      where: {
        senderId: partnerId,
        receiverId: userId,
        status: MessageStatus.SENT
      }
    })
  }

  /**
   * Mark messages as read for a specific conversation
   */
  async markConversationAsRead(userId: string, partnerId: string): Promise<void> {
    await this.createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ })
      .where('senderId = :partnerId', { partnerId })
      .andWhere('receiverId = :userId', { userId })
      .andWhere('status = :status', { status: MessageStatus.SENT })
      .execute()
  }
}
