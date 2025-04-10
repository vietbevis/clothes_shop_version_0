import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import categoryRegistry from './category'
import authRegistry from './auth'
import addressRegistry from './address'
import imageRegistry from './image'
import userRegistry from './user'
import shopRegistry from './shop'
import productRegistry from './product'
import commentRegistry from './comment'
import chatRegistry from './chat'

const registry = new OpenAPIRegistry()

authRegistry(registry)
addressRegistry(registry)
categoryRegistry(registry)
imageRegistry(registry)
userRegistry(registry)
shopRegistry(registry)
productRegistry(registry)
commentRegistry(registry)
chatRegistry(registry)

export default registry
