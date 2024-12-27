import { hash } from 'bcryptjs'
import { cloneDeep, isArray, isObject, map, omit, reduce } from 'lodash'
import { type ObjectLiteral } from 'typeorm'

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}

export const omitFields = <T extends ObjectLiteral>(data: T, fields: string[] = []) => {
  const omitFieldsDefault = [
    'createdAt',
    'updatedAt',
    'password',
    'providerId',
    'roles',
    'privateKey',
    'publicKey',
    'status',
    ...fields
  ]

  const deepOmit = (obj: any): any => {
    if (isArray(obj)) {
      return map(obj, deepOmit)
    } else if (isObject(obj)) {
      const omittedObject = omit(obj, omitFieldsDefault)
      return reduce(
        omittedObject,
        (acc, value, key) => {
          acc[key] = isObject(value) ? deepOmit(value) : value
          return acc
        },
        {} as Record<string, any>
      )
    }
    return obj
  }

  return deepOmit(cloneDeep(data))
}

const saltRounds = 10
export const hashPassword = async (password: string) => hash(password, saltRounds)
