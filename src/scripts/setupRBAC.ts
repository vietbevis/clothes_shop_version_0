import { RBACService } from '@/service/RBACService'
import { AppDataSource } from '@/config/database'
import { RoleBased } from '@/utils/enums'

async function setupRBAC() {
  await AppDataSource.initialize()
  const rbacService = new RBACService()

  try {
    // Create roles
    await rbacService.createRole(RoleBased.ADMIN, 'Administrator with full access')
    await rbacService.createRole(RoleBased.USER, 'User with limited access')

    // Assign permissions to roles
    console.log('RBAC setup completed successfully')
  } catch (error) {
    console.error('Error setting up RBAC:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

setupRBAC()
