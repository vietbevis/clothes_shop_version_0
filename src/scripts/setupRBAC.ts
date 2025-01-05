import { RBACService } from '@/service/RBACService'
import { AppDataSource } from '@/config/database'

async function setupRBAC() {
  await AppDataSource.initialize()
  const rbacService = new RBACService()

  try {
    // Create roles
    await rbacService.createRole('admin', 'Administrator with full access')
    await rbacService.createRole('manager', 'Manager with limited administrative access')
    await rbacService.createRole('staff', 'Staff member with basic access')
    await rbacService.createRole('customer', 'Regular customer')

    // Create resources
    const userManagement = await rbacService.createResource('User Management')
    const productManagement = await rbacService.createResource('Product Management')
    const orderManagement = await rbacService.createResource('Order Management')

    // Create permissions and associate with resources
    await rbacService.createPermission('manage_users', 'Manage all users', userManagement.id)
    await rbacService.createPermission('view_users', 'View user list', userManagement.id)
    await rbacService.createPermission('manage_products', 'Manage all products', productManagement.id)
    await rbacService.createPermission('view_products', 'View product list', productManagement.id)
    await rbacService.createPermission('manage_orders', 'Manage all orders', orderManagement.id)
    await rbacService.createPermission('view_orders', 'View order list', orderManagement.id)

    // Assign permissions to roles
    await rbacService.addPermissionToRole('admin', 'manage_users')
    await rbacService.addPermissionToRole('admin', 'manage_products')
    await rbacService.addPermissionToRole('admin', 'manage_orders')
    await rbacService.addPermissionToRole('manager', 'view_users')
    await rbacService.addPermissionToRole('manager', 'manage_products')
    await rbacService.addPermissionToRole('manager', 'view_orders')
    await rbacService.addPermissionToRole('staff', 'view_products')
    await rbacService.addPermissionToRole('staff', 'view_orders')
    await rbacService.addPermissionToRole('customer', 'view_products')

    console.log('RBAC setup completed successfully')
  } catch (error) {
    console.error('Error setting up RBAC:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

setupRBAC()
