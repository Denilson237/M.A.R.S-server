import { z } from 'zod';

const schema = z.object({
  name: z.string()
  .min(1, 'Name is required')
});

// Define the schema for bulk create requests
const bulkCreateSchema = z.object({
  data: z.array(schema).min(1, { message: "At least one item must be provided." })
});

// Define the schema for bulk delete requests
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one ID must be provided." })
});

interface IRequest {
    name: string;
}
interface IBulkDeleteRequest {
    data: { id: string }[];
}
interface IBulkCreateRequest {
    data: { name: string }[];
}

export { IRequest,IBulkDeleteRequest,IBulkCreateRequest }
// Export the schemas
export { schema, bulkCreateSchema , bulkDeleteSchema };