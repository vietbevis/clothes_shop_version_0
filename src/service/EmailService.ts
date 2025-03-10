import apiClient from '@/config/axiosClient'
import { logError, logInfo } from '@/utils/log'
import { Injectable } from '@/decorators/inject'
import { SendEmailType } from '@/validation/AuthSchema'

@Injectable()
export class EmailService {
  async sendEmail(body: SendEmailType) {
    try {
      await apiClient.post('/api/v1/send-email-verify-account', body)
      logInfo('Email sent successfully')
    } catch (error) {
      logError('Error when sending email: ' + error)
    }
  }
}
