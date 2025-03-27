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
import { SocketService } from './service/SocketService'
import http from 'http'

extendZodWithOpenApi(z)

async function initialize() {
  try {
    getRedisClient()

    await AppDataSource.initialize()
    logInfo('Database Connected')

    // Init Permission, Role
    const seed = Container.resolve<SeedService>(SeedService)
    await seed.initPermission()
    await seed.initRoles()

    const app = Container.resolve<Application>(Application)
    const socketService = Container.resolve<SocketService>(SocketService)
    const server = http.createServer(app.app)
    socketService.initialize(server)

    // Init Folder for Upload File
    initFolder()

    await InitMinio()
    logInfo('Minio Connected')

    server.listen(envConfig.PORT, () => {
      logInfo('Server is running on port ' + envConfig.PORT)
    })
  } catch (error: any) {
    logError('Internal Server Error: ', error as Error)
  }
}
initialize()
