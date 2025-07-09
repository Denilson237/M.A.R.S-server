import { z } from 'zod';

const idSchema = z.string().uuid();

const createSchema = z.object({
  contractNumber: z.string()
    .min(1, 'contractNumber required')
    .regex(/^\d{9}$/, 'contractNumber must contain exactly 9 digits'),
  type: z.string(),
  reasonId: z.string(),
  unpaidCount: z.number().optional(),
  unpaidAmount: z.number().optional(),
});

const updateSchema = z.object({
  contractNumber: z.string()
    .min(1, 'contractNumber required')
    .regex(/^\d{9}$/, 'contractNumber must contain exactly 9 digits')
    .optional(),
  type: z.string().optional(),
  reasonId: z.string().optional(),
});


const bulkCreateSchema = z.object({
  assignments: z.array(
    createSchema
  )
});


// Define the schema for bulk delete requests
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one ID must be provided." })
});


interface IRequest {
  contractNumber: string;
  type: string;
}
interface IBulkCreateRequest {
  data: { name: string }[];
}

export { IRequest, IBulkCreateRequest }

// Export the schemas
export { idSchema, createSchema, updateSchema,bulkCreateSchema, bulkDeleteSchema };