import { type Express, type NextFunction, type Request, type Response } from 'express'
import routes_v1 from '@/route/v1'
import { static as static_ } from 'express'

const PREFIX = '/api/v1'

const routes = (app: Express) => {
  // app.use(static_('script'))
  app.use(static_('scripts'))
  app.use(PREFIX, routes_v1)
  app.use('/ping', (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).send('PONG')
  })
}

export default routes
