import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import { NextFunction, Request, Response } from 'express'
import uploadFileService from '@/service/UploadFileService'
import { ImageType } from '@/utils/enums'

export const uploadFileHandler = async (req: Request, _res: Response, next: NextFunction) => {
  const type = req.params.type as ImageType
  const uploadedFiles = req.files as Express.Multer.File[]
  if (!uploadedFiles || uploadedFiles.length === 0) throw new BadRequestError('No file uploaded.')
  if (!req.user) throw new UnauthorizedError()

  const filesUploaded = await uploadFileService.uploadImages(uploadedFiles, type, req.user)
  req.filesUploaded = filesUploaded
  return next()
}
