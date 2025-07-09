import { z } from 'zod';

const paymentModeSchema = z.object({
  name: z.string()
  .min(1, 'Name is required')
  .max(100, { message: "Name Less than 100 caracters." })
  .regex(/^[a-zA-Z0-9\s]+$/, { message: "The payment mode name can only contain letters, numbers, and spaces." })
});

// Define the schema for bulk create requests
const bulkCreateSchema = z.object({
  data: z.array(paymentModeSchema).min(1, { message: "At least one payment mode must be provided." })
});

// Define the schema for bulk delete requests
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one ID must be provided." })
});

interface IPaymentModeRequest {
    name: string;
}

interface IBulkDeleteRequest {
    data: { id: string }[];
}

interface IBulkCreateRequest {
    data: { name: string }[];
}

export { IPaymentModeRequest , IBulkDeleteRequest , IBulkCreateRequest}

// Export the schemas
export { paymentModeSchema, bulkCreateSchema , bulkDeleteSchema };