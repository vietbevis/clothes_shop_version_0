import { User } from '@/model/User'
import { Image } from '@/model/Image'

declare module 'express-serve-static-core' {
  interface Request {
    user: User | null
    deviceName: string
    deviceType: string
    filesUploaded: Image[]
  }
}
