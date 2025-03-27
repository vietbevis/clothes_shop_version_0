import { Injectable } from '@/decorators/inject'
import type { Server as HttpServer } from 'http'
import { Server, type Socket } from 'socket.io'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { JwtService } from './JwtService'
import { TokenType } from '@/utils/enums'
import { logError, logInfo } from '@/utils/log'
import { corsConfig } from '@/config/corsConfig'

@Injectable()
export class SocketService {
  private io: Server | null = null
  private userSocketMap: Map<string, Set<string>> = new Map()

  initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: corsConfig,
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new UnauthorizedError('Authentication token is required'))
        }

        const decoded = await JwtService.verifyToken(token, TokenType.ACCESS_TOKEN)
        if (!decoded || typeof decoded !== 'object' || !decoded.payload.id) {
          return next(new UnauthorizedError('Invalid authentication token'))
        }

        // Add user data to socket for easy access
        socket.data.user = decoded.payload
        next()
      } catch (error) {
        logError('Socket authentication error: ' + error)
        next(new UnauthorizedError('Authentication error'))
      }
    })

    this.io.on('connection', this.handleConnection.bind(this))

    return this.io
  }

  private async handleConnection(socket: Socket) {
    const userId = socket.data.user.id
    logInfo(`User connected: ${userId} (Socket ID: ${socket.id})`)

    // Track socket connections for users
    if (!this.userSocketMap.has(userId)) {
      this.userSocketMap.set(userId, new Set())
    }
    this.userSocketMap.get(userId)?.add(socket.id)

    // Join user's personal room
    socket.join(`user:${userId}`)

    // Broadcast user online status
    this.broadcastUserStatus(userId, true)

    // Send list of online users to the newly connected user
    socket.emit('users:online', {
      userIds: Array.from(this.userSocketMap.keys())
    })
    logInfo(`Users online: ${this.getOnlineUserCount()}`)

    // Handle typing indicators
    socket.on('typing:start', (data: { receiverId: string }) => {
      logInfo(`Typing start: ${userId} -> ${data.receiverId}`)
      const recipientRoom = `user:${data.receiverId}`
      socket.to(recipientRoom).emit('typing:start', {
        userId,
        timestamp: new Date().toISOString()
      })
    })

    socket.on('typing:stop', (data: { receiverId: string }) => {
      logInfo(`Typing stop: ${userId} -> ${data.receiverId}`)
      const recipientRoom = `user:${data.receiverId}`
      socket.to(recipientRoom).emit('typing:stop', {
        userId,
        timestamp: new Date().toISOString()
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      logInfo(`User disconnected: ${userId} (Socket ID: ${socket.id})`)

      // Remove socket from tracking
      this.userSocketMap.get(userId)?.delete(socket.id)

      // If this was user's last connection, broadcast offline status
      if (!this.userSocketMap.get(userId)?.size) {
        this.broadcastUserStatus(userId, false)
        this.userSocketMap.delete(userId)
      }
    })
  }

  // Broadcast user online/offline status to all users
  private broadcastUserStatus(userId: string, isOnline: boolean): void {
    if (!this.io) return

    this.io.emit('user:status', {
      userId,
      status: isOnline ? 'online' : 'offline',
      timestamp: new Date().toISOString()
    })
  }

  getIO(): Server | null {
    return this.io
  }

  // Check if a user is online
  isUserOnline(userId: string): boolean {
    return this.userSocketMap.has(userId) && (this.userSocketMap.get(userId)?.size || 0) > 0
  }

  // Get count of online users
  getOnlineUserCount(): number {
    return this.userSocketMap.size
  }

  // Get all online user IDs
  getOnlineUserIds(): string[] {
    return Array.from(this.userSocketMap.keys())
  }

  // Debug method to log all active rooms and their members
  debugRooms(): void {
    if (!this.io) return

    logInfo('--- DEBUG: Active Socket.IO Rooms ---')
    this.io.sockets.adapter.rooms.forEach((sockets, room) => {
      // Skip socket ID rooms
      if (room.includes('socket')) return

      logInfo(`Room: ${room}, Members: ${Array.from(sockets).length}`)
    })
    logInfo('--- END DEBUG ---')
  }
}
