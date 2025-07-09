import { z } from 'zod';

const permissionSchema = z.object({
  name: z.string()
  .min(1, 'Bank name is required')
  .max(100, { message: "Bank name Less than 100 caracters." })
  .regex(/^[a-zA-Z0-9]+-[a-zA-Z0-9-]+$/, { message: "The permission name can only accept <RESSSOUCE>-<NAME>" })
});

// Define the schema for bulk create requests
const bulkCreateSchema = z.object({
  data: z.array(permissionSchema).min(1, { message: "At least one permission must be provided." })
});

// Define the schema for bulk delete requests
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one ID must be provided." })
});

// Export the schemas
export { permissionSchema, bulkCreateSchema , bulkDeleteSchema };
