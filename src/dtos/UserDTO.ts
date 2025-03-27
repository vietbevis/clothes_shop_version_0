import z from 'zod'
import { BaseDTO, BaseEntityDTO, MetaPagination } from './BaseDTO'

export const ProfileDTO = z
  .object({
    gender: z.string(),
    dateOfBirth: z.string().nullable(),
    bio: z.string().nullable(),
    phone: z.string().openapi({ example: '+84999999999' }),
    website: z.string(),
    facebookUrl: z.string(),
    twitterUrl: z.string(),
    instagramUrl: z.string()
  })
  .strip()

export const UserDTO = z
  .object({
    ...BaseEntityDTO.shape,
    email: z.string(),
    username: z.string(),
    shopSlug: z.string().nullable(),
    profile: ProfileDTO.optional(),
    fullName: z.string(),
    avatarUrl: z.string(),
    coverPhotoUrl: z.string()
  })
  .strip()

export const UserRes = z.object({
  ...BaseDTO.shape,
  data: UserDTO
})

export const UsersDataRes = z.object({
  items: z.array(UserDTO),
  meta: MetaPagination
})

export const UsersRes = z.object({
  ...BaseDTO.shape,
  data: UsersDataRes
})
