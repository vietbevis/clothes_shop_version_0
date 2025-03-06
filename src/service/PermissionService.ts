import { PermissionRepository } from '@/repository/PermissionRepository'
import { RouteInfo } from '@/utils/types'
import { Injectable } from '@/decorators/inject'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async checkPermission(permissions: string[]): Promise<boolean> {
    const permissionNames = permissions.map((permission) => ({ id: permission }))
    const existingPermissions = await this.permissionRepository.find({ where: permissionNames })
    return existingPermissions.length === permissions.length
  }

  async initPermissions(routes: Record<string, RouteInfo[]>) {
    const count = await this.permissionRepository.count()
    if (count > 0) return
    const permissions = Object.keys(routes)
      .map((resource) => {
        return routes[resource].map((route) => {
          return this.permissionRepository.create({
            name: `${route.methods} ${route.path}`,
            apiPath: route.path,
            method: route.methods,
            resource
          })
        })
      })
      .flat()
    await this.permissionRepository.save(permissions)
  }
}
