import z from 'zod'
import { BaseDTO, BaseEntityDTO } from './BaseDTO'

export const ProfileDTO = z
  .object({
    fullName: z.string(),
    avatarUrl: z.string(),
    coverPhotoUrl: z.string(),
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
    username: z.string(),
    email: z.string(),
    shopSlug: z.string().nullable(),
    profile: ProfileDTO
  })
  .strip()

export const UserRes = z.object({
  ...BaseDTO.shape,
  data: UserDTO
})
