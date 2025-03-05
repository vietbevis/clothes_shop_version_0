import AddressRepository from '@/repository/AddressRepository'
import { omitFields } from '@/utils/helper'
import { AddressBodyType } from '@/validation/AddressSchema'
import { BadRequestError } from '@/core/ErrorResponse'
import { MESSAGES } from '@/utils/message'
import { DecodedJwtToken } from './JwtService'

class AddressService {
  async getAddress(user: DecodedJwtToken) {
    return AddressRepository.findByUserId(user.payload.id)
  }

  async getAddressById(user: DecodedJwtToken, addressId: string) {
    const result = await AddressRepository.findByIdAndUserId(addressId, user.payload.id)
    if (!result) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)
    return result
  }

  async addAddress(user: DecodedJwtToken, addressData: AddressBodyType) {
    const countAddress = await AddressRepository.countByUserId(user.payload.id)
    if (countAddress >= 10) throw new BadRequestError('Address limit reached')
    const address = AddressRepository.create({ ...addressData, userId: user.payload.id })
    const result = await AddressRepository.save(address)

    if (addressData.isDefault) {
      await this.setAddressDefault(user, result.id)
    }
    return omitFields(result, ['user', 'userId'])
  }

  async deleteAddress(user: DecodedJwtToken, addressId: string) {
    const address = await AddressRepository.findByIdAndUserId(addressId, user.payload.id)
    if (!address) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)
    return AddressRepository.remove(address)
  }

  async updateAddress(user: DecodedJwtToken, addressId: string, addressData: AddressBodyType) {
    const address = await AddressRepository.findByIdAndUserId(addressId, user.payload.id)
    if (!address) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)
    const updatedAddress = AddressRepository.merge(address, addressData)
    const result = await AddressRepository.save(updatedAddress)

    if (addressData.isDefault) {
      await this.setAddressDefault(user, addressId)
    }
    return omitFields(result, ['user', 'userId'])
  }

  async setAddressDefault(user: DecodedJwtToken, addressId: string) {
    const addresses = await AddressRepository.findByUserId(user.payload.id)
    if (!addresses || !addresses.length) throw new BadRequestError('Không tồn tại địa chỉ nào.')
    for (const address of addresses) {
      if (address.id === addressId) {
        address.isDefault = true
      } else {
        address.isDefault = false
      }
    }
    return omitFields(await AddressRepository.save(addresses), ['user', 'userId'])
  }
}

const addressService = new AddressService()
export default addressService
