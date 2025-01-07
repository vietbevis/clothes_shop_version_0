import { type Express, type NextFunction, type Request, type Response } from 'express'

import routes_v1 from '@/route/v1'
import swaggerJSDoc from 'swagger-jsdoc'
import { options } from '@/config/swagger'
import swaggerUi from 'swagger-ui-express'

const PREFIX = '/api'

const routes = (app: Express) => {
  app.use(`${PREFIX}/v1`, routes_v1)
  app.use('/ping', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send('PONG')
  })
  const specs = swaggerJSDoc(options)

  // Routes
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
  })
}

export default routes
