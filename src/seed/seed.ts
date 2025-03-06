import { Application } from '@/app'
import { Injectable } from '@/decorators/inject'
import { PermissionService } from '@/service/PermissionService'
import { RBACService } from '@/service/RBACService'
import { RoleBased } from '@/utils/enums'
import { logError, logInfo } from '@/utils/log'
import { getRoutes, groupRoutesByResource } from '@/utils/routingSetup'

@Injectable()
export class SeedService {
  constructor(
    private readonly server: Application,
    private readonly permissionService: PermissionService,
    private readonly rbacService: RBACService
  ) {}

  async initPermission() {
    const listEndpoints = getRoutes(this.server.app._router.stack)
    const groupedRoutes = groupRoutesByResource(listEndpoints)
    try {
      await this.permissionService.initPermissions(groupedRoutes)
      logInfo('Permission initialized')
    } catch (error: any) {
      logError('Permission initialization failed', error)
    }
  }

  async initRoles() {
    try {
      await this.rbacService.initRoles()
      logInfo('Roles initialized')
    } catch (error: any) {
      logError('Roles initialization failed', error)
    }
  }
}
