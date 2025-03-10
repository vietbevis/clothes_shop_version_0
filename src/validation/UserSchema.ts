import { Gender } from '@/utils/enums'
import { phoneNumberSchema, UrlSchema } from './CommonSchema'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

export const UpdateProfileSchema = z
  .object({
    fullName: z.string().nonempty(),
    avatarUrl: z.string().default(''),
    coverPhotoUrl: z.string().default(''),
    gender: z.nativeEnum(Gender).default(Gender.OTHER),
    dateOfBirth: z.string().date().optional(),
    bio: z.string().default(''),
    phone: phoneNumberSchema,
    website: UrlSchema,
    facebookUrl: UrlSchema,
    twitterUrl: UrlSchema,
    instagramUrl: UrlSchema
  })
  .strict()
  .strip()
  .openapi('UpdateProfileSchema', {
    description: 'Update profile schema',
    title: 'UpdateProfile',
    example: {
      fullName: 'John Doe',
      avatarUrl: '01957fa49d7b74aa8ed07288a3b00214.webp',
      coverPhotoUrl: '01957fa49d7b74aa8ed07288a3b00214.webp',
      gender: Gender.OTHER,
      dateOfBirth: '1990-01-01',
      bio: 'I am a software engineer',
      phone: '0123456789',
      website: 'https://example.com',
      facebookUrl: 'https://facebook.com',
      twitterUrl: 'https://twitter.com',
      instagramUrl: 'https://instagram.com'
    }
  })

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>
