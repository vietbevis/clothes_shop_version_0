import 'reflect-metadata'

import Server from '@/app'
import { AppDataSource } from '@/config/database'
import envConfig from '@/config/envConfig'
import { logError, logInfo } from '@/utils/log'
import { initFolder } from '@/utils/helper'
import { InitMinio } from '@/config/minio'
import { RouteInfo } from './utils/types'
import permissionService from './service/PermissionService'
import { RBACService } from './service/RBACService'
import { RoleBased } from './utils/enums'
// import ShopRepository from './repository/ShopRepository'

const whitelist = ['/api-docs', '/api-docs.json']
const server = new Server()
const PORT = envConfig.PORT
// const rbacService = new RBACService()

void (async () => {
  try {
    await AppDataSource.initialize()
    logInfo('Database Connected')

    // await ShopRepository.delete({ id: '01955ccd-0212-7218-8cc3-f14786001861' })
    // await rbacService.createRole(RoleBased.ADMIN, 'Administrator with full access')
    // await rbacService.createRole(RoleBased.USER, 'User with limited access')

    const listEndpoints = getRoutes(server.app._router.stack)
    const groupedRoutes = groupRoutesByResource(listEndpoints)
    permissionService.initPermissions(groupedRoutes)
    logInfo('Permission initialized')

    initFolder()

    await InitMinio()
    logInfo('Minio Connected')

    server.app.listen(PORT, () => {
      logInfo('Server is running on port ' + PORT)
    })
  } catch (error: any) {
    logError('Internal Server Error: ', error as Error)
  }
})()

function getRoutes(stack: any, prefix = ''): RouteInfo[] {
  let routes: RouteInfo[] = []
  stack.forEach((layer: any) => {
    if (layer.route && whitelist.includes(layer.route.path)) {
      return
    }
    if (layer.route) {
      // Nếu là một route thực sự, cộng dồn prefix với route.path
      const methods = Object.keys(layer.route.methods)
        .map((method) => method.toUpperCase())
        .join(', ')
      routes.push({ path: prefix + layer.route.path, methods })
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      // Nếu là router con, cần lấy mount path của layer này
      const layerPath = extractPath(layer)
      // Gọi đệ quy với prefix mới là prefix hiện tại + layerPath
      routes = routes.concat(getRoutes(layer.handle.stack, prefix + layerPath))
    }
  })
  return routes
}

function extractPath(layer: any): string {
  if (layer.path) {
    return layer.path
  }
  if (layer.regexp) {
    // Biến layer.regexp thành chuỗi, ví dụ: "/^\\/api\\/v1\\/?(?=\\/|$)/i"
    let route = layer.regexp.toString()
    // Loại bỏ các ký tự không cần thiết
    route = route.replace('/^', '').replace('\\/?(?=\\/|$)/i', '').replace(/\\\//g, '/')
    // Nếu kết quả là rỗng hoặc chỉ dấu '/', trả về chuỗi rỗng
    return route === '' || route === '/' ? '' : route
  }
  return ''
}

function groupRoutesByResource(routes: RouteInfo[]): Record<string, RouteInfo[]> {
  const groups: Record<string, RouteInfo[]> = {}
  routes.forEach((route) => {
    // Tách các phần của đường dẫn, loại bỏ chuỗi rỗng
    const parts = route.path.split('/').filter(Boolean)
    // Giả sử ứng dụng của bạn sử dụng prefix là /api/v1,
    // resource sẽ nằm ở vị trí thứ 3 (index 2)
    let resource = 'other'
    if (parts.length >= 3) {
      resource = parts[2]
    } else if (parts.length > 0) {
      resource = parts[0]
    }
    // Nếu nhóm chưa tồn tại, khởi tạo mảng mới
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(route)
  })
  return groups
}
