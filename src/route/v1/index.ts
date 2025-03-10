import express from 'express'
import swaggerUi from 'swagger-ui-express'
import AuthRoute from '@/route/v1/AuthRoute'
import UserRoute from '@/route/v1/UserRoute'
import AddressRoute from '@/route/v1/AddressRoute'
import CategoryRoute from '@/route/v1/CategoryRoute'
import ImageRoute from '@/route/v1/ImageRoute'
import ShopRoute from '@/route/v1/ShopRoute'
import ProductRoute from '@/route/v1/ProductRoute'
import document from '@/config/swagger'

const routes_v1 = express.Router()

routes_v1.use('/auth', AuthRoute)
routes_v1.use('/users', UserRoute)
routes_v1.use('/address', AddressRoute)
routes_v1.use('/categories', CategoryRoute)
routes_v1.use('/images', ImageRoute)
routes_v1.use('/shops', ShopRoute)
routes_v1.use('/products', ProductRoute)

routes_v1.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(document, {
    swaggerOptions: {
      persistAuthorization: true
    },
    customJs: '/swagger-custom.js'
  })
)

export default routes_v1
