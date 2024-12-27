import { type Express, type NextFunction, type Request, type Response } from 'express';

import routes_v1 from '@/route/v1';

const PREFIX = '/api';

const routes = (app: Express) => {
  app.use(`${PREFIX}/v1`, routes_v1);
  app.use('/ping', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send('PONG');
  });
};

export default routes;
