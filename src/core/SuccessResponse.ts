import { type Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { formatDate } from '@/utils/helper'

class SuccessResponse<T = any> {
  code: number = StatusCodes.OK
  status: string = 'success'
  message: string
  data?: T
  timestamp: string = formatDate(new Date())

  constructor(message: string, code: number, data?: T) {
    this.code = code
    this.message = message
    this.data = data
  }

  send(res: Response) {
    return res.status(this.code).json(this)
  }
}

class OkResponse<T = any> extends SuccessResponse<T> {
  constructor(message: string = ReasonPhrases.OK, data?: T) {
    super(message, StatusCodes.OK, data)
  }
}

class CreatedResponse<T = any> extends SuccessResponse<T> {
  constructor(message: string = ReasonPhrases.CREATED, data?: T) {
    super(message, StatusCodes.CREATED, data)
  }
}

export { CreatedResponse, OkResponse }
