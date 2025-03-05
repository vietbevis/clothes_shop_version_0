import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import imageController from '@/controller/ImageController'
import asyncHandler from '@/middleware/asyncHandler'
import multerFileMiddleware from '@/middleware/multerFileMiddleware'
import { uploadFileHandler } from '@/middleware/uploadFileHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { PaginationQuerySchema } from '@/validation/CommonSchema'

const ImageRoute = Router()

ImageRoute.post(
  '/',
  authMiddleware,
  asyncHandler(multerFileMiddleware.array('files', 10)),
  asyncHandler(uploadFileHandler),
  imageController.uploadImage
)
ImageRoute.get(
  '/',
  validateRequest({ query: PaginationQuerySchema }),
  authMiddleware,
  asyncHandler(imageController.getImages)
)

export default ImageRoute
