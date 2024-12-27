import 'reflect-metadata';

import Server from '@/app';
import { AppDataSource } from '@/config/database';
import envConfig from '@/config/envConfig';
import { logError, logInfo } from '@/utils/log';

const server = new Server();
const PORT = envConfig.PORT;

void (async () => {
  try {
    await AppDataSource.initialize();
    logInfo('Database Connected');
    server.app.listen(PORT, () => {
      logInfo('Server is running on port ' + PORT);
    });
  } catch (error: any) {
    logError('Internal Server Error: ', error as Error);
  }
})();
