import { RouteInfo } from './types'

/** Lấy danh sách các route từ Express router stack */
export const getRoutes = (stack: any, prefix = ''): RouteInfo[] => {
  const whitelist = ['/api-docs', '/api-docs.json']
  const extractPath = (layer: any): string => {
    if (layer.path) {
      return layer.path
    }
    if (layer.regexp) {
      let route = layer.regexp.toString()
      route = route.replace('/^', '').replace('\\/?(?=\\/|$)/i', '').replace(/\\\//g, '/')
      return route === '' || route === '/' ? '' : route
    }
    return ''
  }

  let routes: RouteInfo[] = []
  stack.forEach((layer: any) => {
    if (layer.route && whitelist.includes(layer.route.path)) {
      return
    }
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map((method) => method.toUpperCase())
        .join(', ')
      routes.push({ path: prefix + layer.route.path, methods })
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const layerPath = extractPath(layer)
      routes = routes.concat(getRoutes(layer.handle.stack, prefix + layerPath))
    }
  })
  return routes
}

/** Nhóm các route theo resource */
export const groupRoutesByResource = (routes: RouteInfo[]): Record<string, RouteInfo[]> => {
  const groups: Record<string, RouteInfo[]> = {}
  routes.forEach((route) => {
    const parts = route.path.split('/').filter(Boolean)
    let resource = 'other'
    if (parts.length >= 3) {
      resource = parts[2]
    } else if (parts.length > 0) {
      resource = parts[0]
    }
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(route)
  })
  return groups
}
