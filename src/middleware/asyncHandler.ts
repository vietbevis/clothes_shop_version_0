import { type NextFunction, type Request, RequestHandler, type Response } from 'express'

const asyncHandler = (fn: RequestHandler<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler
