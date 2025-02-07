import { CreateShopType, UpdateShopType } from '@/validation/ShopSchema'
import { User } from '@/model/User'
import { BadRequestError, EntityError, UnauthorizedError, ValidationError } from '@/core/ErrorResponse'
import AddressRepository from '@/repository/AddressRepository'
import { AppDataSource } from '@/config/database'
import ShopRepository from '@/repository/ShopRepository'
import ImageRepository from '@/repository/ImageRepository'
import { Shop } from '@/model/Shop'
import { getSlug } from '@/utils/helper'
import { ApproveStatus, ShopStatus } from '@/utils/enums'
import { ApproveQueryType } from '@/validation/CommonSchema'
import { AddressBodyType } from '@/validation/AddressSchema'
import { Request } from 'express'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { Like } from 'typeorm'

class ShopService {
  async createShop(shop: CreateShopType, user: User | null) {
    return AppDataSource.manager.transaction(async (transaction) => {
      if (!user) throw new UnauthorizedError()

      const AddressRepo = transaction.withRepository(AddressRepository)
      const ShopRepo = transaction.withRepository(ShopRepository)
      const ImageRepo = transaction.withRepository(ImageRepository)

      const existingShop = await ShopRepo.findByOwner(user.id)
      if (existingShop) throw new BadRequestError('Shop already exists')

      const logo = await ImageRepo.findByFileNameAndUserId(shop.logo, user.id)
      if (!logo) throw new ValidationError('Logo not found', [new EntityError('logo', 'Logo not found')])

      const banner = await ImageRepo.findByFileNameAndUserId(shop.banner, user.id)
      if (!banner) throw new ValidationError('Banner not found', [new EntityError('banner', 'Banner not found')])

      const address = AddressRepo.create({ ...shop.address })
      const result = await AddressRepo.save(address)

      const newShop: Shop = ShopRepo.create({
        ...shop,
        slug: getSlug(shop.name),
        address: result,
        owner: user,
        logo,
        banner
      })

      return ShopRepo.save(newShop)
    })
  }

  async updateShop(shop: UpdateShopType, user: User | null) {
    if (!user) throw new UnauthorizedError()

    const currentShop = await ShopRepository.findByOwner(user.id)
    if (!currentShop) throw new BadRequestError('Shop not found')

    const { banner, logo, name, ...rest } = shop

    const updatedShop = ShopRepository.merge(currentShop, rest)

    if (name && name !== currentShop.name) {
      updatedShop.name = name
      updatedShop.slug = getSlug(name)
    }

    if (logo) {
      const newLogo = await ImageRepository.findByFileNameAndUserId(logo, user.id)
      if (!newLogo) throw new ValidationError('Logo not found', [new EntityError('logo', 'Logo not found')])

      updatedShop.logo = newLogo
    }
    if (banner) {
      const newBanner = await ImageRepository.findByFileNameAndUserId(banner, user.id)
      if (!newBanner) throw new ValidationError('Banner not found', [new EntityError('banner', 'Banner not found')])

      updatedShop.banner = newBanner
    }

    return ShopRepository.save(updatedShop)
  }

  async changeShopStatus(status: ShopStatus, user: User | null) {
    if (!user) throw new UnauthorizedError()

    const shop = await ShopRepository.findByOwner(user.id)
    if (!shop) throw new BadRequestError('Shop not found')

    shop.status = status
    return ShopRepository.save(shop)
  }

  async approveShop(shopId: string, status: ApproveQueryType['status']) {
    const shop = await ShopRepository.findById(shopId)
    if (!shop) throw new BadRequestError('Shop not found')

    if (shop.status !== ShopStatus.PENDING) throw new BadRequestError('Shop is not pending')

    if (status === ApproveStatus.APPROVED) {
      shop.status = ShopStatus.OPEN
    }

    return ShopRepository.save(shop)
  }

  async updateAddressShop(address: AddressBodyType, user: User | null) {
    if (!user) throw new UnauthorizedError()

    const shop = await ShopRepository.findByOwner(user.id, { address: true })
    if (!shop) throw new BadRequestError('Shop not found')

    const updatedAddress = AddressRepository.merge(shop.address, address)

    return AddressRepository.save(updatedAddress)
  }

  async getShopByShopSlug(slug: string) {
    return ShopRepository.findByShopSlug(slug, { owner: true, address: true, logo: true, banner: true })
  }

  async getAllShops(name: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    return PaginationUtils.paginate(
      ShopRepository,
      paginationOptions,
      { name: name ? Like(`%${name}%`) : undefined },
      { owner: true }
    )
  }
}

const shopService = new ShopService()
export default shopService
