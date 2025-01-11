import { AppDataSource } from '@/config/database'
import { Image } from '@/model/Image'
import { In } from 'typeorm'

const ImageRepository = AppDataSource.getRepository(Image).extend({
  async findByFileNameAndUserId(fileName: string, userId: string) {
    return this.findOne({ where: { fileName, userId } })
  },
  async findByFileName(fileName: string) {
    return this.findOne({ where: { fileName } })
  },
  async findByFilenames(filenames: string[]) {
    return this.find({ where: { fileName: In(filenames) } })
  }
})

export type TImageRepository = typeof ImageRepository
export default ImageRepository
