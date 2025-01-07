import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import { NextFunction, Request, Response } from 'express'
import imageService from '@/service/ImageService'
import { ImageType } from '@/utils/enums'

export const uploadFileHandler = async (req: Request, _res: Response, next: NextFunction) => {
  const type = req.query.type as ImageType
  const uploadedFiles = req.files as Express.Multer.File[]
  if (!uploadedFiles || uploadedFiles.length === 0) throw new BadRequestError('No file uploaded.')
  if (!req.user) throw new UnauthorizedError()

  const filesUploaded = await imageService.uploadImages(uploadedFiles, type, req.user)
  req.filesUploaded = filesUploaded
  return next()
}
