import z from 'zod';
import { emailSchema, passwordSchema, userAgentSchema } from './main.schema';

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z.object({
  newPassword: passwordSchema,
});

export const VerificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    verificationCodeId: VerificationCodeSchema,
    confirmNewPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmNewPassword'],
  });
