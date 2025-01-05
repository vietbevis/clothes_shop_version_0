import { User } from '@/model/User'
import { hashPassword, omitFields } from '@/utils/helper'
import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError } from '@/core/ErrorResponse'
import { ImageType } from '@/utils/enums'
import { Image } from '@/model/Image'
import ImageRepository from '@/repository/ImageRepository'

class UserService {
  constructor() {}

  async createUser(userData: Partial<User>): Promise<User> {
    const { username, email, password, fullName } = userData

    // Check if user already exists
    const existingUser = await UserRepository.findOne({ where: [{ username }, { email }] })
    if (existingUser) {
      throw new Error('User with this username or email already exists')
    }

    // Hash the password
    const hashedPassword = await hashPassword(password!)

    // Create new user
    const user = UserRepository.create({
      username,
      email,
      fullName,
      password: hashedPassword
    })

    return UserRepository.save(user)
  }

  async loadUserByEmail(email: string): Promise<User | null> {
    return UserRepository.loadUserByEmail(email, { roles: true })
  }

  async getMe(user: User) {
    const result = await UserRepository.findById(user.id, { profile: true, avatar: true, coverPhoto: true })
    if (!result) throw new BadRequestError()
    return omitFields(result, [])
  }

  async getUserByUsername(username: string) {
    const result = await UserRepository.findByUsernameAndActiveProfile(username, { avatar: true, coverPhoto: true })
    if (!result) throw new BadRequestError('User not found')
    return omitFields(result, [])
  }

  async changeImageProfile(user: User, body: Image[], type: ImageType.AVATAR | ImageType.COVER) {
    if (type === ImageType.AVATAR) {
      user.avatar = body[0]
    } else if (type === ImageType.COVER) {
      user.coverPhoto = body[0]
    }

    const result = await UserRepository.save(user)
    const res = type === ImageType.AVATAR ? result.avatar : result.coverPhoto
    return omitFields(res, ['userId', 'user'])
  }

  async changeImageProfileLink(user: User, filename: string, type: ImageType) {
    const targetImage = await this.findOrCreateImage(user, filename, type)

    if (type === ImageType.AVATAR) {
      user.avatar = targetImage
    } else if (type === ImageType.COVER) {
      user.coverPhoto = targetImage
    }

    const result = await UserRepository.save(user)

    const res = type === ImageType.AVATAR ? result.avatar : result.coverPhoto
    return omitFields(res, ['userId', 'user'])
  }

  async findOrCreateImage(user: User, filename: string, type: ImageType) {
    // Lấy tất cả ảnh theo fileName và userId
    const imgs = await ImageRepository.findByFileNameAndUserId(filename, user.id)
    if (!imgs || imgs.length === 0) {
      throw new BadRequestError('Image not found')
    }

    // Tìm ảnh có type trùng khớp với yêu cầu
    const existingImageWithType = imgs.find((img) => img.type === type)

    let targetImage: Image

    if (!existingImageWithType) {
      // Nếu không có ảnh với type mong muốn, tạo mới dựa trên ảnh đầu tiên
      const newImage = ImageRepository.create({
        fileName: imgs[0].fileName, // Dùng fileName của ảnh gốc
        width: imgs[0].width,
        height: imgs[0].height,
        type, // Gán type mới
        user // Liên kết với user hiện tại
      })

      // Lưu ảnh mới vào database
      targetImage = await ImageRepository.save(newImage)
    } else {
      // Nếu đã có ảnh với type mong muốn, sử dụng ảnh đó
      targetImage = existingImageWithType
    }

    return targetImage
  }
}

const userService = new UserService()
export default userService
