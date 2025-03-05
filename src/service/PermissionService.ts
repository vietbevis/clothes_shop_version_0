import { PermissionRepository } from '@/repository/PermissionRepository'
import { RouteInfo } from '@/utils/types'

class PermissionService {
  async checkPermission(permissions: string[]): Promise<boolean> {
    const permissionNames = permissions.map((permission) => ({ id: permission }))
    const existingPermissions = await PermissionRepository.find({ where: permissionNames })
    return existingPermissions.length === permissions.length
  }

  async initPermissions(routes: Record<string, RouteInfo[]>) {
    const count = await PermissionRepository.count()
    if (count > 0) return
    const permissions = Object.keys(routes)
      .map((resource) => {
        return routes[resource].map((route) => {
          return PermissionRepository.create({
            name: `${route.methods} ${route.path}`,
            apiPath: route.path,
            method: route.methods,
            resource
          })
        })
      })
      .flat()
    await PermissionRepository.save(permissions)
  }
}

export const permissionService = new PermissionService()
export default permissionService
