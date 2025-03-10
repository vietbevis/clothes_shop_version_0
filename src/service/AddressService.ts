import { AddressRepository } from '@/repository/AddressRepository'
import { AddressBodyType } from '@/validation/AddressSchema'
import { BadRequestError } from '@/core/ErrorResponse'
import { MESSAGES } from '@/utils/message'
import { DecodedJwtToken } from './JwtService'
import { Injectable } from '@/decorators/inject'
import { AddressDTO, ListAddressData } from '@/dtos/AddressDTO'

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async getAddress(user: DecodedJwtToken) {
    const addresses = await this.addressRepository.findByUserId(user.payload.id)
    return ListAddressData.parse(addresses)
  }

  async getAddressById(user: DecodedJwtToken, addressId: string) {
    const result = await this.addressRepository.findByIdAndUserId(addressId, user.payload.id)
    if (!result) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)
    return AddressDTO.parse(result)
  }

  async addAddress(user: DecodedJwtToken, addressData: AddressBodyType) {
    const countAddress = await this.addressRepository.countByUserId(user.payload.id)
    if (countAddress >= 10) throw new BadRequestError('Address limit reached')
    const address = this.addressRepository.create({ ...addressData, userId: user.payload.id })
    const result = await this.addressRepository.save(address)

    if (addressData.isDefault) {
      await this.setAddressDefault(user, result.id)
    }
    return AddressDTO.parse(result)
  }

  async deleteAddress(user: DecodedJwtToken, addressId: string) {
    const address = await this.addressRepository.findByIdAndUserId(addressId, user.payload.id)
    if (!address) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)
    return this.addressRepository.remove(address)
  }

  async updateAddress(user: DecodedJwtToken, addressId: string, addressData: AddressBodyType) {
    const address = await this.addressRepository.findByIdAndUserId(addressId, user.payload.id)
    if (!address) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)
    const updatedAddress = this.addressRepository.merge(address, addressData)
    const result = await this.addressRepository.save(updatedAddress)

    if (addressData.isDefault) {
      await this.setAddressDefault(user, addressId)
    }
    return AddressDTO.parse(result)
  }

  async setAddressDefault(user: DecodedJwtToken, addressId: string) {
    const addresses = await this.addressRepository.findByUserId(user.payload.id)
    if (!addresses || !addresses.length) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)

    const address = addresses.find((address) => address.id === addressId)
    if (!address) throw new BadRequestError(MESSAGES.ADDRESS_NOT_FOUND)

    const updatedAddresses = addresses.map((address) => ({
      ...address,
      isDefault: address.id === addressId
    }))

    const result = await this.addressRepository.save(updatedAddresses)

    return ListAddressData.parse(result)
  }
}
