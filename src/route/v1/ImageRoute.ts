import { Router } from 'express'
import { authMiddleware } from '@/middleware/authMiddleware'
import imageController from '@/controller/ImageController'
import asyncHandler from '@/middleware/asyncHandler'
import multerFileMiddleware from '@/middleware/multerFileMiddleware'
import { uploadFileHandler } from '@/middleware/uploadFileHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { PaginationQuerySchema } from '@/validation/CommonSchema'

const ImageRoute = Router()

/**
 * @openapi
 * /v1/images:
 *   post:
 *     summary: Upload images
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UploadImage'
 *     responses:
 *       200:
 *         description: Successful upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 */
ImageRoute.post(
  '/',
  authMiddleware,
  asyncHandler(multerFileMiddleware.array('files', 10)),
  asyncHandler(uploadFileHandler),
  imageController.uploadImage
)

/**
 * @openapi
 * /v1/images:
 *   get:
 *     summary: Get images
 *     tags: [Images]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 24
 *           minimum: 1
 *           maximum: 100
 *           default: 24
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           example: 'createdAt'
 *       - in: query
 *         name: sortDirection
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['ASC', 'DESC']
 *           example: 'ASC'
 *     responses:
 *       200:
 *         description: Get images
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageDataResponse'
 */
ImageRoute.get(
  '/',
  validateRequest({ query: PaginationQuerySchema }),
  authMiddleware,
  asyncHandler(imageController.getImages)
)

export default ImageRoute
