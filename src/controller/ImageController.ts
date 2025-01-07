import { Request, Response } from 'express'
import { omitFields } from '@/utils/helper'
import { OkResponse } from '@/core/SuccessResponse'
import imageService from '@/service/ImageService'

class ImageController {
  async uploadImage(req: Request, res: Response) {
    new OkResponse('Image uploaded', omitFields(req.filesUploaded, ['user', 'userId'])).send(res)
  }

  async getImages(req: Request, res: Response) {
    const username = req.user?.username as string
    const result = await imageService.getImage(req, username)
    new OkResponse('Image data', result).send(res)
  }
}

const imageController = new ImageController()
export default imageController
