import { hash } from 'bcryptjs'
import { cloneDeep, isArray, isObject, map, omit, reduce } from 'lodash'
import { type ObjectLiteral } from 'typeorm'
import { v7 } from 'uuid'
import path from 'path'
import fs from 'fs'

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}

export const UPLOAD_TEMP_DIR = 'uploads'
export const UPLOAD_TEMP_DIR_OPTIMIZE = 'uploads/optimized'

export const initFolder = () => {
  const uploadFolderPath = path.resolve(UPLOAD_TEMP_DIR)
  const optimizeFolderPath = path.resolve(UPLOAD_TEMP_DIR_OPTIMIZE)
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, { recursive: true })
    console.log('Created: ' + uploadFolderPath)
  }
  if (!fs.existsSync(optimizeFolderPath)) {
    fs.mkdirSync(optimizeFolderPath, { recursive: true })
    console.log('Created: ' + optimizeFolderPath)
  }
}

export const getUsername = (fullName: string) => {
  const arr = fullName.trim().split(' ')
  let newName = ''
  if (arr.length >= 2) {
    newName = arr[0].trim() + ' ' + arr[arr.length - 1].trim()
  } else {
    newName = arr[0].trim()
  }
  newName = newName.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
  return newName + '_' + v7().replace(/-/g, '').slice(9)
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
