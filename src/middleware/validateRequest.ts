import { type NextFunction, type Request, type Response } from 'express'
import { ZodError, type ZodTypeAny } from 'zod'

import { InternalServerError, ValidationError } from '@/core/ErrorResponse'

interface ValidationSchemas {
  body?: ZodTypeAny
  query?: ZodTypeAny
  params?: ZodTypeAny
}

export function validateRequest({ body, query, params }: ValidationSchemas = {}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (body) {
        req.body = body.parse(req.body)
      }

      // Validate query
      if (query) {
        req.query = query.parse(req.query)
      }

      // Validate params
      if (params) {
        req.params = params.parse(req.params)
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages: { field: string; message: string }[] = []

        error.issues.forEach((issue) => {
          const field = issue.path.join('.')
          const existingError = errorMessages.find((error) => error.field === field)

          if (existingError) {
            existingError.message += `\n ${issue.message}`
          } else {
            errorMessages.push({
              field,
              message: issue.message
            })
          }
        })

        throw new ValidationError('Validation error.', errorMessages)
      }

      throw new InternalServerError()
    }

    next()
  }
}
