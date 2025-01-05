import { AppDataSource } from '@/config/database'
import { RBACService } from '@/service/RBACService'
import userService from '@/service/UserService'

async function setupDefaultAdmin() {
  await AppDataSource.initialize()
  const rbacService = new RBACService()

  try {
    // Create default admin user
    const adminUser = await userService.createUser({
      username: 'admin',
      email: 'admin@example.com',
      password: 'adminPassword123!', // In a real scenario, use a secure password and don't hardcode it
      fullName: 'Administrator'
    })

    // Assign admin role to the user
    await rbacService.assignRoleToUser(adminUser.id, 'admin')

    console.log('Default admin account created successfully')
    console.log('Username: admin')
    console.log('Email: admin@example.com')
    console.log('Password: adminPassword123!')
    console.log('Please change the password after first login')
  } catch (error) {
    console.error('Error setting up default admin account:', error)
  } finally {
    await AppDataSource.destroy()
  }
}

setupDefaultAdmin()
