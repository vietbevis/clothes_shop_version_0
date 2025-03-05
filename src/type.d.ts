import { Image } from '@/model/Image'
import { DecodedJwtToken } from './service/JwtService'

declare module 'express-serve-static-core' {
  interface Request {
    user: DecodedJwtToken
    deviceId: string
    filesUploaded: Image[]
  }
}
