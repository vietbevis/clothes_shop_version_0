import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import envConfig from './envConfig'
import registry from './openapi/registry'

const generator = new OpenApiGeneratorV3(registry.definitions)
const document = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'API Documentation',
    description: 'API Documentation for the project',
    termsOfService: 'https://ecom.vittapcode.id.vn/terms',
    contact: {
      name: 'API Support',
      url: 'https://ecom.vittapcode.id.vn/support',
      email: 'nguyenvanviet.150204@gmail.com'
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
    }
  },
  servers: [{ url: `http://localhost:${envConfig.PORT}/api` }],
  security: [
    {
      BearerAuth: []
    }
  ]
})

document.components = document.components || {}
document.components.securitySchemes = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'Authorization',
    in: 'header',
    description: 'JWT Authorization header using the Bearer scheme'
  }
}

export default document
