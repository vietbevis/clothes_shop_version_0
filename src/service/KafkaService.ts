import envConfig from '@/config/envConfig'
import { Injectable } from '@/decorators/inject'
import { Kafka, type Producer, type Consumer, logLevel } from 'kafkajs'
import { v7 as uuidv7 } from 'uuid'
import { logError, logInfo } from '@/utils/log'
import { SocketService } from './SocketService'
import { MessageEventType } from '@/utils/enums'

interface KafkaMessagePayload {
  eventType: MessageEventType
  [key: string]: any
}

@Injectable()
export class KafkaService {
  private kafka: Kafka
  private producer: Producer
  private consumer: Consumer

  constructor(private readonly socketService: SocketService) {
    this.kafka = new Kafka({
      clientId: 'chat-app',
      brokers: [envConfig.KAFKA_BROKER || 'localhost:9092'],
      logLevel: logLevel.ERROR,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    })

    this.producer = this.kafka.producer()
    this.consumer = this.kafka.consumer({ groupId: 'chat-group' })
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect()
      await this.consumer.connect()
      await this.consumer.subscribe({ topic: 'chat-messages', fromBeginning: false })

      await this.consumer.run({
        eachMessage: async ({ message }) => {
          try {
            if (!message.value) return

            const payload: KafkaMessagePayload = JSON.parse(message.value.toString())
            logInfo(`Processing Kafka message: ${payload.eventType}`)

            await this.processMessage(payload)
          } catch (error) {
            logError('Error processing Kafka message: ' + error)
          }
        }
      })

      logInfo('KafkaService connected successfully')
    } catch (error) {
      logError('Failed to connect to Kafka: ' + error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect()
      await this.consumer.disconnect()
      logInfo('KafkaService disconnected successfully')
    } catch (error) {
      logError('Error disconnecting from Kafka: ' + error)
    }
  }

  async sendMessage(message: any): Promise<string> {
    const kafkaMessageId = uuidv7()
    try {
      await this.producer.send({
        topic: 'chat-messages',
        messages: [
          {
            key: message.conversationId || kafkaMessageId,
            value: JSON.stringify({ ...message, kafkaMessageId })
          }
        ]
      })
      return kafkaMessageId
    } catch (error) {
      logError('Error sending Kafka message: ' + error)
      throw error
    }
  }

  private async processMessage(payload: KafkaMessagePayload): Promise<void> {
    // Get Socket.IO instance
    const io = this.socketService.getIO()
    if (!io) {
      logError('Socket.IO not initialized')
      return
    }

    switch (payload.eventType) {
      case 'MESSAGE_CREATED':
        await this.processMessageCreated(payload, io)
        break

      case 'MESSAGE_UPDATED':
        await this.processMessageUpdated(payload, io)
        break

      case 'MESSAGE_DELETED':
        await this.processMessageDeleted(payload, io)
        break

      case 'MESSAGE_STATUS_UPDATED':
        await this.processMessageStatusUpdated(payload, io)
        break

      default:
        logInfo(`Unknown event type: ${payload.eventType}`)
    }
  }

  private async processMessageCreated(payload: any, io: any): Promise<void> {
    const recipientRoom = `user:${payload.receiver.id}`

    // Gửi tin nhắn đến phòng người nhận
    io.to(recipientRoom).emit('message:new', payload)
    logInfo(`Message sent to ${payload.receiver.id}`)
  }

  private async processMessageUpdated(payload: any, io: any): Promise<void> {
    const recipientRoom = `user:${payload.receiver.id}`

    // Gửi tin nhắn đã cập nhật đến phòng người nhận
    io.to(recipientRoom).emit('message:update', payload)
  }

  private async processMessageDeleted(payload: any, io: any): Promise<void> {
    const senderRoom = `user:${payload.sender.id}`
    const recipientRoom = `user:${payload.receiver.id}`

    // Thông báo xóa tin nhắn đến người nhận
    io.to(recipientRoom).emit('message:delete', {
      messageId: payload.messageId
    })

    // Xác nhận xóa cho người gửi
    // io.to(senderRoom).emit('message:deleted', {
    // messageId: payload.messageId
    // })
  }

  private async processMessageStatusUpdated(payload: any, io: any): Promise<void> {
    const senderRoom = `user:${payload.sender.id}`
    const recipientRoom = `user:${payload.receiver.id}`

    // Gửi trạng thái tin nhắn đến người gửi
    io.to(senderRoom).emit('message:status', {
      messageIds: payload.messageIds,
      status: payload.status
    })
  }
}
