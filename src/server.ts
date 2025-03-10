import 'reflect-metadata'
import { Application } from '@/app'
import { AppDataSource } from '@/config/database'
import envConfig from '@/config/envConfig'
import { logError, logInfo } from '@/utils/log'
import { initFolder } from '@/utils/helper'
import { InitMinio } from '@/config/minio'
import { getRedisClient } from './config/redis'
import Container from './container'
import { SeedService } from './seed/seed'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

class ServerApplication {
  private readonly port: number
  private readonly server: Application

  constructor(app: Application) {
    this.server = app
    this.port = envConfig.PORT
  }

  async initialize() {
    try {
      getRedisClient()

      await AppDataSource.initialize()
      logInfo('Database Connected')

      // Init Permission, Role
      const seed = Container.resolve<SeedService>(SeedService)
      await seed.initPermission()
      await seed.initRoles()

      // Init Folder for Upload File
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

const app = new ServerApplication(Container.resolve<Application>(Application))
app.initialize()
