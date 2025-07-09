import { z } from 'zod';

const schema = z.object({
  typeId: z.string().uuid({ message: "Invalid type ID format." }),
  name: z.string()
  .min(1, 'Name is required')
  .max(100, { message: "Name Less than 100 caracters." })
  .regex(/^[a-zA-Z0-9\s]+$/, { message: "The name can only contain letters, numbers, and spaces." }),
  description: z.string().optional()
});


const updateSchema = z.object({
  typeId: z.string().uuid({ message: "Invalid type ID format." }).optional(),
  name: z.string()
  .min(1, 'Name is required')
  .max(100, { message: "Name Less than 100 caracters." })
  .regex(/^[a-zA-Z0-9\s]+$/, { message: "The name can only contain letters, numbers, and spaces." })
  .optional(),
  description: z.string().optional()
});


// Define the schema for bulk create requests
const bulkCreateSchema = z.object({
  data: z.array(schema).min(1, { message: "At least one bank must be provided." })
});

// Define the schema for bulk delete requests
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one ID must be provided." })
});

// Export the schemas
export { schema,updateSchema, bulkCreateSchema , bulkDeleteSchema };


interface IBulkCreateRequest {
    data: { name: string }[];
}

interface IBulkDeleteRequest {
    data: { id: string }[];
}

export { IBulkCreateRequest , IBulkDeleteRequest};