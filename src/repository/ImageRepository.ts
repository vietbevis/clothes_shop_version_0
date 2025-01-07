import { AppDataSource } from '@/config/database'
import { Image } from '@/model/Image'

const ImageRepository = AppDataSource.getRepository(Image).extend({
  async findByFileNameAndUserId(fileName: string, userId: string) {
    return this.findOne({ where: { fileName, userId } })
  },
  async findByFileName(fileName: string) {
    return this.findOne({ where: { fileName } })
  }
})

export default ImageRepository
