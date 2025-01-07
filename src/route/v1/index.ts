import express from 'express'

import AuthRoute from '@/route/v1/AuthRoute'
import UserRoute from '@/route/v1/UserRoute'
import AddressRoute from '@/route/v1/AddressRoute'
import CategoryRoute from '@/route/v1/CategoryRoute'
import ImageRoute from '@/route/v1/ImageRoute'

const routes_v1 = express.Router()

routes_v1.use('/auth', AuthRoute)
routes_v1.use('/users', UserRoute)
routes_v1.use('/address', AddressRoute)
routes_v1.use('/categories', CategoryRoute)
routes_v1.use('/images', ImageRoute)

export default routes_v1
