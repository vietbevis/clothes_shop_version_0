import { User } from '@/model/User'
import AddressRepository from '@/repository/AddressRepository'
import { omitFields } from '@/utils/helper'
import { AddressBodyType } from '@/validation/AddressSchema'
import { BadRequestError } from '@/core/ErrorResponse'
import { MESSAGES } from '@/utils/message'

class AddressService {
  async getAddress(user: User) {
    const result = await AddressRepository.findByUserId(user.id)
    return omitFields(result, [])
  }

  async addAddress(user: User, addressData: AddressBodyType) {
    const countAddress = await AddressRepository.countByUserId(user.id)
    if (countAddress >= 10) throw new BadRequestError('Address limit reached')
    const address = AddressRepository.create({ ...addressData, user })
    const result = await AddressRepository.save(address)

    if (addressData.isDefault) {
      await this.setAddressDefault(user, result.id)
    }
    return omitFields(result, ['user', 'userId'])
  }

  async deleteAddress(user: User, addressId: string) {
    const address = await AddressRepository.findByIdAndUserId(addressId, user.id)
    if (!address) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)
    return AddressRepository.remove(address)
  }

  async updateAddress(user: User, addressId: string, addressData: AddressBodyType) {
    const address = await AddressRepository.findByIdAndUserId(addressId, user.id)
    if (!address) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)
    const updatedAddress = AddressRepository.merge(address, addressData)
    const result = await AddressRepository.save(updatedAddress)

    if (addressData.isDefault) {
      await this.setAddressDefault(user, addressId)
    }
    return omitFields(result, ['user', 'userId'])
  }

  async setAddressDefault(user: User, addressId: string) {
    const addresses = await AddressRepository.findByUserId(user.id)
    if (!addresses) throw new BadRequestError()
    for (const address of addresses) {
      if (address.id === addressId) {
        address.isDefault = true
      } else {
        address.isDefault = false
      }
    }
    return AddressRepository.save(addresses)
  }
}

const addressService = new AddressService()
export default addressService
