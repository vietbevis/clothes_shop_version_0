import { CreateShopType, UpdateShopType } from '@/validation/ShopSchema'
import { User } from '@/model/User'
import { BadRequestError, EntityError, UnauthorizedError, ValidationError } from '@/core/ErrorResponse'
import AddressRepository from '@/repository/AddressRepository'
import { AppDataSource } from '@/config/database'
import ShopRepository from '@/repository/ShopRepository'
import ImageRepository from '@/repository/ImageRepository'
import { Shop } from '@/model/Shop'
import { generateSlug, omitFields } from '@/utils/helper'
import { ApproveStatus, ShopStatus } from '@/utils/enums'
import { ApproveQueryType } from '@/validation/CommonSchema'
import { AddressBodyType } from '@/validation/AddressSchema'
import { Request } from 'express'
import { PaginationUtils } from '@/utils/PaginationUtilsV2'
import { Like } from 'typeorm'
import { DecodedJwtToken } from './JwtService'
import { pick } from 'lodash'

class ShopService {
  async createShop(shop: CreateShopType, user: DecodedJwtToken) {
    return AppDataSource.manager.transaction(async (transaction) => {
      const AddressRepo = transaction.withRepository(AddressRepository)
      const ShopRepo = transaction.withRepository(ShopRepository)
      const ImageRepo = transaction.withRepository(ImageRepository)

      const existingShop = await ShopRepo.findByOwner(user.payload.id)
      if (existingShop) throw new BadRequestError('Shop already exists')

      const [logo, banner] = await Promise.all([
        ImageRepo.findByFileNameAndUserId(shop.logo, user.payload.id),
        ImageRepo.findByFileNameAndUserId(shop.banner, user.payload.id)
      ])
      if (!logo) throw new ValidationError('Logo not found', [new EntityError('logo', 'Logo not found')])
      if (!banner) throw new ValidationError('Banner not found', [new EntityError('banner', 'Banner not found')])

      const address = AddressRepo.create({ ...shop.address })
      const result = await AddressRepo.save(address)

      const newShop: Shop = ShopRepo.create({
        ...shop,
        slug: generateSlug(shop.name),
        address: result,
        owner: { id: user.payload.id },
        logo,
        banner
      })

      return omitFields(await ShopRepo.save(newShop), ['owner', 'deletedAt', 'logo', 'banner'])
    })
  }

  async updateShop(shop: UpdateShopType, user: DecodedJwtToken) {
    const currentShop = await ShopRepository.findByOwner(user.payload.id, { address: true })
    if (!currentShop) throw new BadRequestError('Shop not found')

    const { banner, logo, name, address, ...rest } = shop

    const updatedShop = ShopRepository.merge(currentShop, rest)
    updatedShop.address = AddressRepository.merge(currentShop.address, address)

    if (name !== currentShop.name) {
      updatedShop.name = name
      updatedShop.slug = generateSlug(name)
    }

    if (logo !== currentShop.logoUrl) {
      const newLogo = await ImageRepository.findByFileNameAndUserId(logo, user.payload.id)
      if (!newLogo) throw new ValidationError('Logo not found', [new EntityError('logo', 'Logo not found')])
      updatedShop.logo = newLogo
    }
    if (banner !== currentShop.bannerUrl) {
      const newBanner = await ImageRepository.findByFileNameAndUserId(banner, user.payload.id)
      if (!newBanner) throw new ValidationError('Banner not found', [new EntityError('banner', 'Banner not found')])
      updatedShop.banner = newBanner
    }

    return omitFields(await ShopRepository.save(updatedShop), ['owner', 'deletedAt', 'logo', 'banner'])
  }

  async changeShopStatus(status: ShopStatus, user: DecodedJwtToken) {
    const shop = await ShopRepository.findByOwner(user.payload.id)
    if (!shop) throw new BadRequestError('Shop not found')

    shop.status = status
    return omitFields(await ShopRepository.save(shop), ['owner', 'deletedAt'])
  }

  async approveShop(shopId: string, status: ApproveQueryType['status']) {
    const shop = await ShopRepository.findById(shopId)
    if (!shop) throw new BadRequestError('Shop not found')

    if (shop.status !== ShopStatus.PENDING) throw new BadRequestError('Shop is not pending')

    if (status === ApproveStatus.APPROVED) {
      shop.status = ShopStatus.OPEN
    }

    return omitFields(await ShopRepository.save(shop), ['owner', 'deletedAt'])
  }

  async getShopByShopSlug(slug: string) {
    const result = await ShopRepository.findByShopSlug(slug, { address: true, owner: true })
    if (!result) throw new BadRequestError('Shop not found or deleted')
    return { ...result, owner: pick(result.owner, ['username', 'email', 'fullName']) }
  }

  async getAllShops(name: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    return PaginationUtils.paginate(ShopRepository, paginationOptions, { name: name ? Like(`%${name}%`) : undefined })
  }
}

const shopService = new ShopService()
export default shopService
