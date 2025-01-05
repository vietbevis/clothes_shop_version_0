import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'

import { corsConfig } from '@/config/corsConfig'
import { ErrorHandling } from '@/middleware/errorHandling'
import router from '@/route'
import { morganMiddleware } from '@/utils/logger'

class Server {
  app: Express = express()

  constructor() {
    this.app = express()
    this.setupApplication()
  }

  setupApplication() {
    this.configureMiddlewares()
    this.configureRoutes()
    this.configureErrorHandling()
  }

  configureMiddlewares() {
    this.app.use(cors(corsConfig))
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(cookieParser())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(morganMiddleware)
  }

  configureRoutes() {
    router(this.app)
  }

  configureErrorHandling() {
    this.app.use(ErrorHandling.endPointNotFound)
    this.app.use(ErrorHandling.globalError)
  }
}

export default Server
