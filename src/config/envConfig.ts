import 'dotenv/config'

import { z } from 'zod'

import { logError } from '@/utils/log'

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string(),
  VERIFICATION_TOKEN_EXPIRES_IN: z.string(),
  MINIO_HOST: z.string(),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESSKEY: z.string(),
  MINIO_SECRETKEY: z.string(),
  BASE_IMAGE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string()
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  logError('Environment variables validation failed:')
  logError(configServer.error.issues.map((item) => item.path[0] + ': ' + item.message).join('\n'))
  throw new Error('Invalid environment variables')
}

const envConfig = configServer.data
export default envConfig

export type ProcessEnv = z.infer<typeof configSchema>
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    type CustomProcessEnv = ProcessEnv
  }
}
