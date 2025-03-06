import { AppDataSource } from '@/config/database'
import { Injectable } from '@/decorators/inject'
import { Image } from '@/model/Image'
import { In, Repository } from 'typeorm'

@Injectable()
export class ImageRepository extends Repository<Image> {
  constructor() {
    super(Image, AppDataSource.manager)
  }

  async findByFileNameAndUserId(fileName: string, userId: string) {
    return this.findOne({ where: { fileName, userId } })
  }

  async findByFileName(fileName: string) {
    return this.findOne({ where: { fileName } })
  }

  async findByFilenames(filenames: string[]) {
    return this.find({ where: { fileName: In(filenames) } })
  }
}
