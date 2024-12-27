// eslint-disable-next-line import/order
import path from 'path';
import { DataSource } from 'typeorm';

import envConfig from '@/config/envConfig';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT,
  username: envConfig.DB_USER_NAME,
  password: envConfig.DB_PASSWORD,
  database: envConfig.DB_NAME,
  synchronize: true,
  logging: ['error'],
  entities: [path.join(__dirname, '..', 'model', '*.{js,ts}')],
});
