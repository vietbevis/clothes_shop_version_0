import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import { NextFunction, Request, Response } from 'express'
import { ImageService } from '@/service/ImageService'
import { ImageType } from '@/utils/enums'
import { Injectable } from '@/decorators/inject'
import multer from 'multer'
import { UPLOAD_TEMP_DIR } from '@/utils/helper'
import { v7 } from 'uuid'
import path from 'path'

@Injectable()
export class FileUploadMiddleware {
  constructor(private readonly imageService: ImageService) {}

  private readonly storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOAD_TEMP_DIR) // Thư mục tạm lưu file
    },
    filename: (_req, _file, cb) => {
      const uniqueSuffix = v7().replace(/-/g, '')
      cb(null, uniqueSuffix + '.webp')
    }
  })

  private readonly multerFile = multer({
    storage: this.storage,
    fileFilter: (_req, file, cb) => {
      const filetypes = /jpeg|jpg|png/
      const mimetype = filetypes.test(file.mimetype)
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

      if (!(mimetype && extname)) {
        cb(new BadRequestError('File upload only supports the following filetypes - ' + filetypes))
      } else {
        return cb(null, true)
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
  })

  multerFileMiddleware = (req: Request, res: Response, next: NextFunction) => {
    this.multerFile.array('files', 10)(req, res, (err) => {
      if (err) {
        return next(err)
      }
      return next()
    })
  }

  uploadFileHandler = async (req: Request, _res: Response, next: NextFunction) => {
    const uploadedFiles = req.files as Express.Multer.File[]
    if (!uploadedFiles || uploadedFiles.length === 0) throw new BadRequestError('No file uploaded.')
    if (!req.user) throw new UnauthorizedError()

    const filesUploaded = await this.imageService.uploadImages(uploadedFiles, req.user)
    req.filesUploaded = filesUploaded
    return next()
  }
}
