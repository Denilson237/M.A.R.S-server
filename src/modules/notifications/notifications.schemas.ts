import { E_NotificationMethod as TYPE } from '@prisma/client';
import { z } from 'zod';

const notificationSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  method: z.enum([TYPE.EMAIL, TYPE.WHATSAPP, TYPE.INTERN, TYPE.AVAILABLE]),
  subject: z.string().min(1),
  message: z.string().min(1),
  template: z.string().min(1),
});

const idSchema = z.number();


// Export the schemas
export { notificationSchema, idSchema };
