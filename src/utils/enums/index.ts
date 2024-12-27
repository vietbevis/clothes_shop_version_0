export enum ImageType {
  IMAGE = 'image',
  AVATAR = 'avatar',
  COVER = 'cover'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum TokenType {
  ACCESS_TOKEN = 'accessToken',
  REFRESH_TOKEN = 'refreshToken'
}

export enum ERole {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_USER = 'ROLE_USER',
  ROLE_MODERATOR = 'ROLE_MODERATOR'
}

export enum UserStatus {
  NOT_VERIFIED = 'not_verified',
  VERIFIED = 'verified',
  BLOCKED = 'blocked',
  DELETED = 'deleted'
}

export type LoginResponseType = {
  [TokenType.ACCESS_TOKEN]: string
  [TokenType.REFRESH_TOKEN]: string
}
