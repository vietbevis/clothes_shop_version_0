import { z } from 'zod'
import { BaseDTO, MetaPagination } from './BaseDTO'
import { MessageStatus } from '@/utils/enums'

export const Sender = z
  .object({
    id: z.string(),
    fullName: z.string(),
    avatarUrl: z.string()
  })
  .strict()
  .strip()

export const Receiver = Sender

export const LastMessage = z
  .object({
    id: z.string(),
    content: z.string(),
    sender: Sender,
    receiver: Receiver,
    images: z.array(z.string()).optional(),
    createdAt: z.string(),
    status: z.nativeEnum(MessageStatus).or(z.string())
  })
  .strict()
  .strip()

export const ConversationsDataRes = z
  .object({
    id: z.string(),
    partnerId: z.string(),
    partnerName: z.string(),
    partnerAvatar: z.string(),
    lastMessage: LastMessage.optional(),
    unreadCount: z.number()
  })
  .strict()
  .strip()

export const ListConversationsDataRes = z.object({
  items: z.array(ConversationsDataRes),
  meta: MetaPagination
})

export const ConversationsRes = z.object({
  ...BaseDTO.shape,
  data: ListConversationsDataRes
})

export const MessageDataRes = z
  .object({
    id: z.string(),
    sender: Sender,
    content: z.string(),
    status: z.nativeEnum(MessageStatus),
    updatedAt: z.string(),
    createdAt: z.string(),
    receiver: Receiver,
    images: z.array(z.string()),
    isSelf: z.boolean()
  })
  .strict()
  .strip()

export const MessagesRes = z.object({
  ...BaseDTO.shape,
  data: MessageDataRes
})

export const ListMessageDataRes = z.object({
  items: z.array(MessageDataRes),
  meta: MetaPagination
})

export const ListMessageRes = z.object({
  ...BaseDTO.shape,
  data: ListMessageDataRes
})

export type ListConversationsDataResType = z.infer<typeof ListConversationsDataRes>
export type ListMessageDataResType = z.infer<typeof ListMessageDataRes>
export type ListMessageResType = z.infer<typeof ListMessageRes>
export type MessagesResType = z.infer<typeof MessagesRes>
export type MessageDataResType = z.infer<typeof MessageDataRes>
export type ConversationsResType = z.infer<typeof ConversationsRes>
export type ConversationsDataResType = z.infer<typeof ConversationsDataRes>
export type LastMessageType = z.infer<typeof LastMessage>
