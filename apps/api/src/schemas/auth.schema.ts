import z from 'zod';
import { emailSchema, passwordSchema } from './main.schema';

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

