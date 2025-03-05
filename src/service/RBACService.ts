import { User } from '@/model/User'
import { Role } from '@/model/Role'
import { Permission } from '@/model/Permisstion'
import { UserRepository } from '@/repository/UserRepository'
import { RoleRepository } from '@/repository/RoleRepository'
import { PermissionRepository } from '@/repository/PermissionRepository'

export class RBACService {
  async assignRoleToUser(userId: string, roleName: string): Promise<User> {
    const [user, role] = await Promise.all([
      UserRepository.findById(userId, { roles: true }),
      RoleRepository.findByName(roleName)
    ])

    if (!user || !role) {
      throw new Error('User or Role not found')
    }

    user.roles.push(role)
    return UserRepository.save(user)
  }

  async createRole(name: string, description: string): Promise<Role> {
    const role = RoleRepository.create({ name, description })
    return RoleRepository.save(role)
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const user = await UserRepository.findById(userId, { roles: true })

    if (!user) {
      return false
    }

    return user.roles.some((role) => role.name === roleName)
  }

  async addPermissionToRole(roleName: string, permissionName: string): Promise<Role> {
    const [role, permission] = await Promise.all([
      RoleRepository.findByName(roleName, { permissions: true }),
      PermissionRepository.findByName(permissionName)
    ])

    if (!role || !permission) {
      throw new Error('Role or Permission not found')
    }

    role.permissions.push(permission)
    return RoleRepository.save(role)
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await UserRepository.findById(userId, { roles: { permissions: true } })

    if (!user) {
      return false
    }

    return user.roles.some((role) => role.permissions.some((permission) => permission.name === permissionName))
  }
}
