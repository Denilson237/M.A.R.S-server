import { z } from 'zod';

const bankSchema = z.object({
  name: z.string()
  .min(1, 'Bank name is required')
  .max(100, { message: "Bank name Less than 100 caracters." })
  .regex(/^[a-zA-Z0-9\s]+$/, { message: "The bank name can only contain letters, numbers, and spaces." })
});

// Define the schema for bulk create requests
const bulkCreateSchema = z.object({
  data: z.array(bankSchema).min(1, { message: "At least one bank must be provided." })
});

// Define the schema for bulk delete requests
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one ID must be provided." })
});

// Export the schemas
export { bankSchema, bulkCreateSchema , bulkDeleteSchema };