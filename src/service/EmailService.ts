import { SendEmailType } from '@/validation/CommonSchema'
import apiClient from '@/config/axiosClient'
import { logError, logInfo } from '@/utils/log'

class EmailService {
  async sendEmail(body: SendEmailType) {
    try {
      await apiClient.post('/send-email-verify-account', body)
      logInfo('Email sent successfully')
    } catch (error) {
      logError('Error when sending email: ' + error)
    }
  }
}

const emailService = new EmailService()
export default emailService
