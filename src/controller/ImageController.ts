import { Request, Response } from 'express'
import { omitFields } from '@/utils/helper'
import { OkResponse } from '@/core/SuccessResponse'
import { ImageService } from '@/service/ImageService'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  async uploadImage(req: Request, res: Response) {
    new OkResponse('Image uploaded', req.filesUploaded).send(res)
  }

  async getImages(req: Request, res: Response) {
    const email = req.user.sub as string
    const result = await this.imageService.getImage(req, email)
    new OkResponse('Image data', result).send(res)
  }
}
