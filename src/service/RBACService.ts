import { User } from '@/model/User'
import { Role } from '@/model/Role'
import { UserRepository } from '@/repository/UserRepository'
import { RoleRepository } from '@/repository/RoleRepository'
import { PermissionRepository } from '@/repository/PermissionRepository'
import { Injectable } from '@/decorators/inject'
import { RoleBased } from '@/utils/enums'

@Injectable()
export class RBACService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async assignRoleToUser(userId: string, roleName: string): Promise<User> {
    const [user, role] = await Promise.all([
      this.userRepository.findById(userId, { roles: true }),
      this.roleRepository.findByName(roleName)
    ])

    if (!user || !role) {
      throw new Error('User or Role not found')
    }

    user.roles.push(role)
    return this.userRepository.save(user)
  }

  async initRoles() {
    const count = await this.roleRepository.count()
    if (count > 0) return
    const roles = [
      { name: RoleBased.ADMIN, description: 'Admin role' },
      { name: RoleBased.USER, description: 'User role' }
    ].map((role) => this.roleRepository.create(role))

    await this.roleRepository.save(roles)
  }

  async createRole(name: string, description: string): Promise<Role> {
    const role = this.roleRepository.create({ name, description })
    return this.roleRepository.save(role)
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId, { roles: true })

    if (!user) {
      return false
    }

    return user.roles.some((role) => role.name === roleName)
  }

  async addPermissionToRole(roleName: string, permissionName: string): Promise<Role> {
    const [role, permission] = await Promise.all([
      this.roleRepository.findByName(roleName, { permissions: true }),
      this.permissionRepository.findByName(permissionName)
    ])

    if (!role || !permission) {
      throw new Error('Role or Permission not found')
    }

    role.permissions.push(permission)
    return this.roleRepository.save(role)
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId, { roles: { permissions: true } })

    if (!user) {
      return false
    }

    return user.roles.some((role) => role.permissions.some((permission) => permission.name === permissionName))
  }
}
