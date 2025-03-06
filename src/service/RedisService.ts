import { getRedisClient } from '@/config/redis'
import { Redis } from 'ioredis'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class RedisService {
  private redisClient: Redis = getRedisClient()

  async setCacheItem(key: string, value: string, expirationInSeconds?: number): Promise<void> {
    if (expirationInSeconds) {
      await this.redisClient.setex(key, expirationInSeconds ?? 0, value)
    } else {
      await this.redisClient.set(key, value)
    }
  }

  async setCacheItemWithLock(key: string, value: string, expirationInSeconds?: number): Promise<boolean> {
    const result = await this.redisClient.call('set', key, value, 'NX', 'PX', expirationInSeconds ?? 0)
    return result === 'OK'
  }

  async getCacheItem(key: string): Promise<string | null> {
    return this.redisClient.get(key)
  }

  async deleteCacheItem(key: string): Promise<boolean> {
    const result = await this.redisClient.del(key)
    return result > 0
  }

  /**
   * TTL (Thời gian sống còn lại của 1 key)
   * @param key
   */
  async getCacheItemTTL(key: string): Promise<number> {
    return this.redisClient.ttl(key)
  }
}
