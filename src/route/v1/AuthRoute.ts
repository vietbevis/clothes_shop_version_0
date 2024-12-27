import express from 'express';

import { OkResponse } from '@/core/SuccessResponse';

const AuthRoute = express.Router();

AuthRoute.get('/', (req, res) => {
  new OkResponse('Hello World').send(res);
});

export default AuthRoute;
