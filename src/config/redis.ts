import { Redis } from 'ioredis'
import envConfig from '@/config/envConfig'
import { logError, logInfo } from '@/utils/log'

let redisClient: Redis | null = null

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: envConfig.REDIS_HOST,
      port: envConfig.REDIS_PORT,
      password: envConfig.REDIS_PASSWORD,
      maxRetriesPerRequest: null
    })

    redisClient.on('connect', () => {
      logInfo('Redis Connected')
    })

    redisClient.on('error', (err) => {
      logError('[Redis Error]: ', err)
    })
  }
  return redisClient
}
