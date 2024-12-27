import express from 'express';

import AuthRoute from '@/route/v1/AuthRoute';

const routes_v1 = express.Router();

routes_v1.use('/auth', AuthRoute);

export default routes_v1;
