import path from 'path'
import sharp from 'sharp'
import fs from 'fs/promises'
import { omitFields, UPLOAD_TEMP_DIR_OPTIMIZE } from '@/utils/helper'
import { ImageType } from '@/utils/enums'
import { ProcessedImage } from '@/utils/types'
import { BUCKET_NAME, minioClient } from '@/config/minio'
import { ImageRepository } from '@/repository/ImageRepository'
import { Request } from 'express'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { BadRequestError } from '@/core/ErrorResponse'
import { DecodedJwtToken } from './JwtService'
import { Injectable } from '@/decorators/inject'
import { ListImageResData } from '@/dtos/ImageDTO'

@Injectable()
export class ImageService {
  constructor(private imageRepository: ImageRepository) {}

  async uploadImages(uploadedFiles: Express.Multer.File[], user: DecodedJwtToken) {
    const processedImages = await Promise.all(uploadedFiles.map(this.processImage))
    const newImages = processedImages.map((image) =>
      this.imageRepository.create({
        ...image,
        user: { id: user.payload.id }
      })
    )
    const savedImages = await this.imageRepository.save(newImages)

    return ListImageResData.parse(savedImages)
  }

  async findImageByFilenamesOrFail(filename: string | string[]) {
    if (filename instanceof Array) {
      const imagesReq = new Set(filename)
      const images = await this.imageRepository.findByFilenames([...imagesReq])
      if (images.length !== imagesReq.size) {
        throw new BadRequestError('Image not found')
      }
      return images
    }

    const image = await this.imageRepository.findByFileName(filename)
    if (!image) {
      throw new BadRequestError('Image not found')
    }
    return image
  }

  async getImage(req: Request, email: string) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    const paginatedUsers = await PaginationUtils.paginate(this.imageRepository, paginationOptions, {
      user: { email }
    })
    return omitFields(paginatedUsers, ['userId', 'user'])
  }

  private async processImage(file: Express.Multer.File): Promise<ProcessedImage> {
    const optimizedPath = path.join(UPLOAD_TEMP_DIR_OPTIMIZE, file.filename)

    try {
      const metadata = await sharp(file.path).metadata()

      let width = metadata.width || 0
      let height = metadata.height || 0
      let sharpInstance = sharp(file.path)

      // Resize if width is greater than 1920
      if (width > 1920) {
        const aspectRatio = width / height
        width = 1920
        height = Math.round(1920 / aspectRatio)
        sharpInstance = sharpInstance.resize(width, height)
      }

      await sharpInstance.webp({ quality: 80, effort: 0 }).toFile(optimizedPath)

      await minioClient.fPutObject(BUCKET_NAME, file.filename, optimizedPath)

      await Promise.all([fs.unlink(file.path).catch(() => {}), fs.unlink(optimizedPath).catch(() => {})])

      return {
        fileName: file.filename,
        width,
        height
      }
    } catch (error) {
      await Promise.all([fs.unlink(file.path).catch(() => {}), fs.unlink(optimizedPath).catch(() => {})])
      throw error
    }
  }
}
