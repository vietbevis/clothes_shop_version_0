import { HttpMethod } from '@/utils/enums'
import z from 'zod'

export const CreatePermissionSchema = z.object({
  name: z.string().trim().min(3).max(150),
  apiPath: z.string().trim().min(3).max(100),
  method: z.nativeEnum(HttpMethod),
  resource: z.string().trim().min(3).max(100),
  roles: z.array(z.string().uuid()).optional()
})

export const UpdatePermissionSchema = CreatePermissionSchema

export type CreatePermissionBodyType = z.infer<typeof CreatePermissionSchema>
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionSchema>
