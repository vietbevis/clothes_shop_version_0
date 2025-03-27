import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { FileUploadMiddleware } from '@/middleware/uploadFileHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { PaginationQuerySchema } from '@/validation/CommonSchema'
import { resolveController } from '@/container'
import { ImageController } from '@/controller/ImageController'

const ImageRoute = Router()

ImageRoute.post(
  '/',
  authMiddleware,
  resolveController(FileUploadMiddleware, 'multerFileMiddleware'),
  resolveController(FileUploadMiddleware, 'uploadFileHandler'),
  resolveController(ImageController, 'uploadImage')
)
ImageRoute.get(
  '/',
  validateRequest({ query: PaginationQuerySchema }),
  authMiddleware,
  resolveController(ImageController, 'getImages')
)

export default ImageRoute
