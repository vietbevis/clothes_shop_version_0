import { CreateShopType, UpdateShopType } from '@/validation/ShopSchema'
import { BadRequestError, EntityError, ValidationError } from '@/core/ErrorResponse'
import { AppDataSource } from '@/config/database'
import { Shop } from '@/model/Shop'
import { generateSlug, omitFields } from '@/utils/helper'
import { ApproveStatus, ShopStatus } from '@/utils/enums'
import { ApproveQueryType } from '@/validation/CommonSchema'
import { Request } from 'express'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { Like } from 'typeorm'
import { DecodedJwtToken } from './JwtService'
import { pick } from 'lodash'
import { AddressRepository } from '@/repository/AddressRepository'

import { Injectable } from '@/decorators/inject'
import { ShopRepository } from '@/repository/ShopRepository'
import { ImageRepository } from '@/repository/ImageRepository'

@Injectable()
export class ShopService {
  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly imageRepository: ImageRepository,
    private readonly addressRepository: AddressRepository
  ) {}

  async createShop(shop: CreateShopType, user: DecodedJwtToken) {
    return AppDataSource.manager.transaction(async (transaction) => {
      const AddressRepo = transaction.withRepository(this.addressRepository)
      const ShopRepo = transaction.withRepository(this.shopRepository)
      const ImageRepo = transaction.withRepository(this.imageRepository)

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
    const currentShop = await this.shopRepository.findByOwner(user.payload.id, { address: true })
    if (!currentShop) throw new BadRequestError('Shop not found')

    const { banner, logo, name, address, ...rest } = shop

    const updatedShop = this.shopRepository.merge(currentShop, rest)
    updatedShop.address = this.addressRepository.merge(currentShop.address, address)

    if (name !== currentShop.name) {
      updatedShop.name = name
      updatedShop.slug = generateSlug(name)
    }

    if (logo !== currentShop.logoUrl) {
      const newLogo = await this.imageRepository.findByFileNameAndUserId(logo, user.payload.id)
      if (!newLogo) throw new ValidationError('Logo not found', [new EntityError('logo', 'Logo not found')])
      updatedShop.logo = newLogo
    }
    if (banner !== currentShop.bannerUrl) {
      const newBanner = await this.imageRepository.findByFileNameAndUserId(banner, user.payload.id)
      if (!newBanner) throw new ValidationError('Banner not found', [new EntityError('banner', 'Banner not found')])
      updatedShop.banner = newBanner
    }

    return omitFields(await this.shopRepository.save(updatedShop), ['owner', 'deletedAt', 'logo', 'banner'])
  }

  async changeShopStatus(status: ShopStatus, user: DecodedJwtToken) {
    const shop = await this.shopRepository.findByOwner(user.payload.id)
    if (!shop) throw new BadRequestError('Shop not found')

    shop.status = status
    return omitFields(await this.shopRepository.save(shop), ['owner', 'deletedAt'])
  }

  async approveShop(shopId: string, status: ApproveQueryType['status']) {
    const shop = await this.shopRepository.findById(shopId)
    if (!shop) throw new BadRequestError('Shop not found')

    if (shop.status !== ShopStatus.PENDING) throw new BadRequestError('Shop is not pending')

    if (status === ApproveStatus.APPROVED) {
      shop.status = ShopStatus.OPEN
    }

    return omitFields(await this.shopRepository.save(shop), ['owner', 'deletedAt'])
  }

  async getShopByShopSlug(slug: string) {
    const result = await this.shopRepository.findByShopSlug(slug, { address: true, owner: true })
    if (!result) throw new BadRequestError('Shop not found or deleted')
    return { ...result, owner: pick(result.owner, ['username', 'email', 'fullName']) }
  }

  async getAllShops(name: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    return PaginationUtils.paginate(this.shopRepository, paginationOptions, {
      name: name ? Like(`%${name}%`) : undefined
    })
  }
}
