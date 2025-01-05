import { SendEmailType } from '@/validation/CommonSchema'
import apiClient from '@/config/axiosClient'
import { logError } from '@/utils/log'

class EmailService {
  async sendEmail(body: SendEmailType) {
    try {
      const result = await apiClient.post('/send-email-verify-account', body)
      console.log(result.data)
    } catch (error) {
      logError('Error when sending email: ' + error)
    }
  }
}

const emailService = new EmailService()
export default emailService
