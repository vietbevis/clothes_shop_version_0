import { type CorsOptions } from 'cors'

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4000',
  'http://localhost:4001',
  'http://localhost:5173',
  'https://ecom.vittapcode.id.vn',
  null // Dành cho Postman (origin null)
]

export const corsConfig: CorsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  origin: function (origin, callback) {
    callback(null, true)
    // Kiểm tra nếu origin nằm trong danh sách cho phép hoặc là undefined (trường hợp non-browser client)
    // if (!origin || allowedOrigins.includes(origin)) {
    //   callback(null, true) // Cho phép truy cập
    // } else {
    //   callback(new Error('Not allowed by CORS')) // Từ chối truy cập
    // }
  }
}
