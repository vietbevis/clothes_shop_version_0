import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import { FileUploadMiddleware } from '@/middleware/uploadFileHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { PaginationQuerySchema } from '@/validation/CommonSchema'
import { resolveInstance } from '@/container'
import { ImageController } from '@/controller/ImageController'

const ImageRoute = Router()

ImageRoute.post(
  '/',
  authMiddleware,
  resolveInstance(FileUploadMiddleware, 'multerFileMiddleware'),
  resolveInstance(FileUploadMiddleware, 'uploadFileHandler'),
  resolveInstance(ImageController, 'uploadImage')
)
ImageRoute.get(
  '/',
  validateRequest({ query: PaginationQuerySchema }),
  authMiddleware,
  resolveInstance(ImageController, 'getImages')
)

export default ImageRoute
