import { AppDataSource } from '@/config/database'
import { Image } from '@/model/Image'

const ImageRepository = AppDataSource.getRepository(Image).extend({
  async findByFileNameAndUserId(fileName: string, userId: string) {
    return this.find({ where: { fileName, userId } })
  }
})

export default ImageRepository
