import { CreateShopType, UpdateShopType } from '@/validation/ShopSchema'
import { BadRequestError } from '@/core/ErrorResponse'
import { AppDataSource } from '@/config/database'
import { Shop } from '@/model/Shop'
import { generateSlug } from '@/utils/helper'
import { ApproveStatus, ShopStatus } from '@/utils/enums'
import { ApproveQueryType } from '@/validation/CommonSchema'
import { Request } from 'express'
import { PaginationUtils } from '@/utils/PaginationUtils'
import { Like } from 'typeorm'
import { DecodedJwtToken } from './JwtService'
import { AddressRepository } from '@/repository/AddressRepository'
import { Injectable } from '@/decorators/inject'
import { ShopRepository } from '@/repository/ShopRepository'
import { PaginateShopDTO, ShopDTO } from '@/dtos/ShopDTO'

@Injectable()
export class ShopService {
  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly addressRepository: AddressRepository
  ) {}

  async createShop(shop: CreateShopType, user: DecodedJwtToken) {
    return AppDataSource.manager.transaction(async (transaction) => {
      const AddressRepo = transaction.withRepository(this.addressRepository)
      const ShopRepo = transaction.withRepository(this.shopRepository)

      const existingShop = await ShopRepo.findByOwner(user.payload.id)
      if (existingShop) throw new BadRequestError('Shop already exists')

      const address = AddressRepo.create({ ...shop.address })
      const result = await AddressRepo.save(address)

      const newShop: Shop = ShopRepo.create({
        ...shop,
        slug: generateSlug(shop.name),
        address: result,
        owner: { id: user.payload.id }
      })

      const savedShop = await ShopRepo.save(newShop)

      return ShopDTO.parse(savedShop)
    })
  }

  async updateShop(shop: UpdateShopType, user: DecodedJwtToken) {
    const currentShop = await this.shopRepository.findByOwner(user.payload.id, { address: true })
    if (!currentShop) throw new BadRequestError('Shop not found')

    if (currentShop.status === ShopStatus.PENDING) {
      throw new BadRequestError('Shop is not approved yet')
    }

    const { bannerUrl, logoUrl, name, address, ...rest } = shop

    const updatedShop = this.shopRepository.merge(currentShop, rest)
    updatedShop.address = this.addressRepository.merge(currentShop.address, address)

    if (name !== currentShop.name) {
      updatedShop.name = name
      updatedShop.slug = generateSlug(name)
    }

    const savedShop = await this.shopRepository.save(updatedShop)

    return ShopDTO.parse(savedShop)
  }

  async approveShop(shopId: string, status: ApproveQueryType['status']) {
    const shop = await this.shopRepository.findById(shopId)
    if (!shop) throw new BadRequestError('Shop not found')

    if (shop.status !== ShopStatus.PENDING) throw new BadRequestError('Shop is not pending')

    if (status === ApproveStatus.APPROVED) {
      shop.status = ShopStatus.OPEN
    }

    await this.shopRepository.save(shop)

    return true
  }

  async getShopByShopSlug(slug: string) {
    const result = await this.shopRepository.findByShopSlug(slug)
    if (!result) throw new BadRequestError('Shop not found or deleted')
    return ShopDTO.parse(result)
  }

  async getAllShops(name: string, req: Request) {
    const paginationOptions = PaginationUtils.extractPaginationOptions(req, 'createdAt')
    const result = await PaginationUtils.paginate(this.shopRepository, paginationOptions, {
      name: name ? Like(`%${name}%`) : undefined
    })
    return PaginateShopDTO.parse(result)
  }
}
