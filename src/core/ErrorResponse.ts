import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { formatDate } from '@/utils/helper'

class ErrorResponse extends Error {
  status: number
  errors?: any
  timestamp: string = formatDate(new Date())

  constructor(message: string, status: number, errors?: any) {
    super(message)
    this.status = status
    this.errors = errors
    this.name = this.constructor.name
  }
}

// Các lớp cụ thể cho từng loại lỗi
class NotFoundError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.NOT_FOUND, errors?: any) {
    super(message, StatusCodes.NOT_FOUND, errors)
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.BAD_REQUEST, errors?: any) {
    super(message, StatusCodes.BAD_REQUEST, errors)
  }
}

class UnauthorizedError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.UNAUTHORIZED, errors?: any) {
    super(message, StatusCodes.UNAUTHORIZED, errors)
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.FORBIDDEN, errors?: any) {
    super(message, StatusCodes.FORBIDDEN, errors)
  }
}

class MethodNotAllowedError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.METHOD_NOT_ALLOWED, errors?: any) {
    super(message, StatusCodes.METHOD_NOT_ALLOWED, errors)
  }
}

class InternalServerError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.INTERNAL_SERVER_ERROR, errors?: any) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, errors)
  }
}

class ValidationError extends ErrorResponse {
  constructor(message: string = ReasonPhrases.UNPROCESSABLE_ENTITY, errors?: any) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY, errors)
  }
}

export {
  BadRequestError,
  ErrorResponse,
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
}
