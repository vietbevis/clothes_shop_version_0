import 'reflect-metadata'
import { Application } from '@/app'
import { AppDataSource } from '@/config/database'
import envConfig from '@/config/envConfig'
import { logError, logInfo } from '@/utils/log'
import { initFolder } from '@/utils/helper'
import { InitMinio } from '@/config/minio'
import { getRedisClient } from './config/redis'

class ServerApplication {
  private readonly port: number
  private readonly server: Application

  constructor() {
    this.server = new Application()
    this.port = envConfig.PORT
  }

  async initialize() {
    try {
      getRedisClient()

      await AppDataSource.initialize()
      logInfo('Database Connected')

      initFolder()

      await InitMinio()
      logInfo('Minio Connected')

      this.server.app.listen(this.port, () => {
        logInfo('Server is running on port ' + this.port)
      })
    } catch (error: any) {
      logError('Internal Server Error: ', error as Error)
    }
  }
}

const app = new ServerApplication()
app.initialize()
