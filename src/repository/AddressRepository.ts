import { Address } from '@/model/Address'
import { AppDataSource } from '@/config/database'
import { Repository } from 'typeorm'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class AddressRepository extends Repository<Address> {
  constructor() {
    super(Address, AppDataSource.manager)
  }

  async findByUserId(userId: string) {
    return this.find({ where: { userId } })
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.findOne({ where: { id, userId } })
  }

  async countByUserId(userId: string) {
    return this.count({ where: { userId } })
  }
}
