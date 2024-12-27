import 'dotenv/config';

import { z } from 'zod';

import { logError } from '@/utils/log';

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  logError('Environment variables validation failed:');
  logError(configServer.error.issues.map((item) => item.path[0] + ': ' + item.message).join('\n'));
  throw new Error('Invalid environment variables');
}

const envConfig = configServer.data;
export default envConfig;

export type ProcessEnv = z.infer<typeof configSchema>;
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    type CustomProcessEnv = ProcessEnv;
  }
}
