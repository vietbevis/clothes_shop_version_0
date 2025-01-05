import multer from 'multer'
import path from 'path'
import { BadRequestError } from '@/core/ErrorResponse'
import { UPLOAD_TEMP_DIR } from '@/utils/helper'
import { v7 } from 'uuid'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_TEMP_DIR) // Thư mục tạm lưu file
  },
  filename: (_req, _file, cb) => {
    const uniqueSuffix = v7().replace(/-/g, '')
    cb(null, uniqueSuffix + '.webp')
  }
})
const multerFileMiddleware = multer({
  storage: storage,
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

export default multerFileMiddleware
