import { Request, Response } from 'express'
import { omitFields } from '@/utils/helper'
import { OkResponse } from '@/core/SuccessResponse'
import imageService from '@/service/ImageService'

class ImageController {
  async uploadImage(req: Request, res: Response) {
    new OkResponse('Image uploaded', omitFields(req.filesUploaded, ['user', 'userId'])).send(res)
  }

  async getImages(req: Request, res: Response) {
    const email = req.user.sub as string
    const result = await imageService.getImage(req, email)
    new OkResponse('Image data', result).send(res)
  }
}

const imageController = new ImageController()
export default imageController
