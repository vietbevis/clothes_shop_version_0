// Basic Auth credentials
import axios from 'axios'

const username = 'vietnguyen'
const password = 'Vietviet@150204'

// Tạo một instance của Axios với Basic Auth
const apiClient = axios.create({
  baseURL: 'https://send-email-service.vittapcode.id.vn',
  auth: {
    username,
    password
  }
})

export default apiClient
