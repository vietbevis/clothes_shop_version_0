import { type CorsOptions } from 'cors'

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4000',
  'http://localhost:4001',
  'http://localhost:5173',
  'http://localhost:3000/',
  'http://localhost:3001/',
  'http://localhost:4000/',
  'http://localhost:4001/',
  'http://localhost:5173/',
  'https://ecom.vittapcode.id.vn',
  'https://shop.vittapcode.id.vn',
  'https://shop.vittapcode.id.vn/',
  null // Dành cho Postman (origin null)
]

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS error: Origin '${origin}' is not allowed.`))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}
