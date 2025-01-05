import express from 'express'

import AuthRoute from '@/route/v1/AuthRoute'
import UserRoute from '@/route/v1/UserRoute'
import AddressRoute from '@/route/v1/AddressRoute'

const routes_v1 = express.Router()

routes_v1.use('/auth', AuthRoute)
routes_v1.use('/users', UserRoute)
routes_v1.use('/address', AddressRoute)

export default routes_v1
