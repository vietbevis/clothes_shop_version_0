import * as Minio from 'minio'
import envConfig from './envConfig'
import { logError, logInfo } from '@/utils/log'

export const minioClient = new Minio.Client({
  endPoint: envConfig.MINIO_HOST,
  port: envConfig.MINIO_PORT,
  useSSL: false,
  accessKey: envConfig.MINIO_ACCESSKEY,
  secretKey: envConfig.MINIO_SECRETKEY
})

export const BUCKET_NAME = 'images'

export const InitMinio = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME)
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
      logInfo('Bucket created successfully in "us-east-1".')
    }
  } catch (err) {
    logError('Error creating bucket:' + err)
  }
}
