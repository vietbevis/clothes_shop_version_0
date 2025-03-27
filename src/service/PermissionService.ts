import { PermissionRepository } from '@/repository/PermissionRepository'
import { RouteInfo } from '@/utils/types'
import { Injectable } from '@/decorators/inject'
import { CreatePermissionBodyType, UpdatePermissionBodyType } from '@/validation/PermissionSchema'
import { RoleRepository } from '@/repository/RoleRepository'
import { In } from 'typeorm'
import { BadRequestError } from '@/core/ErrorResponse'
import { Role } from '@/model/Role'

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository
  ) {}
  async createPermission(body: CreatePermissionBodyType) {
    if (body.roles && body.roles.length > 0) {
      const roles = await this.roleRepository.findBy({ id: In(body.roles) })
      if (roles.length !== body.roles.length) {
        throw new BadRequestError('Some roles do not exist')
      }
    }
    const { name, apiPath, method, resource } = body
    const newPermission = this.permissionRepository.create({ name, apiPath, method, resource })
    return await this.permissionRepository.save(newPermission)
  }

  async updatePermission(id: string, body: UpdatePermissionBodyType) {
    const permission = await this.permissionRepository.findOneBy({ id })
    if (!permission) throw new BadRequestError('Permission does not exist')
    let roles: Role[] = []
    if (body.roles && body.roles.length > 0) {
      roles = await this.roleRepository.findBy({ id: In(body.roles) })
      if (roles.length !== body.roles.length) {
        throw new BadRequestError('Some roles do not exist')
      }
    }
    const { name, apiPath, method, resource } = body
    const updatedPermission = this.permissionRepository.merge(permission, { name, apiPath, method, resource, roles })
    return await this.permissionRepository.save(updatedPermission)
  }

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
