import { z } from 'zod';

// Define the schema for a single BankAgency
const schema = z.object({
  name: z.string()
    .min(1, 'Bank agency name is required')
    .max(250, { message: "Bank agency name must be less than 250 characters." })
    .regex(/^[a-zA-Z0-9\s]+$/, { message: "The bank agency name can only contain letters, numbers, and spaces." }),
  bankId: z.string()
    .uuid('Bank ID input format is not valid'), // Validate that bankId is a valid UUID
  code: z.string().optional(), // Optional field for agency code
  town: z.string().optional(), // Optional field for agency town
  account_number: z.string().optional() // Optional field for account number
});

// Define the schema for updating a BankAgency
const updateSchema = schema.partial(); // Make all fields optional for updates


// Define the schema for bulk create requests for BankAgencies
const bulkCreateSchema = z.object({
  data: z.array(schema).min(1, { message: "At least one bank agency must be provided." })
});

// Define the schema for bulk delete requests for BankAgencies
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one ID must be provided." })
});


interface IRequest {
    name: string;
    town?: string;
    code: string;
    account_number?: string;
    bankId?: string;
}

interface IBulkCreateRequest {
    data: { name: string }[];
}

interface IBulkDeleteRequest {
    data: { id: string }[];
}


export {IRequest, IBulkCreateRequest, IBulkDeleteRequest}

// Export the schemas
export { schema,updateSchema, bulkCreateSchema, bulkDeleteSchema };