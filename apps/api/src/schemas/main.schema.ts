import z from 'zod';

export const emailSchema = z.string().email().min(1).max(255);
export const passwordSchema = z.string().min(8).max(128);
export const userAgentSchema = z.string().optional();
