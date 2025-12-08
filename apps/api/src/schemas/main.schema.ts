import { z } from 'zod';

export const emailSchema=z.string().email("Email is invalid").min(1).max(255);
export const passwordSchema=z.string().min(8,"Password must be at least 8 characters").max(12,"Password must be at most 8 characters");
export const userAgentSchema= z.string().optional();
export const firstNameSchema = z.string().min(1, "First name is required");
export const lastNameSchema = z.string().min(1, "Last name is required");
export const designationSchema = z.string().min(1, "Designation is required");
export const contactNumberSchema = z.string().min(10, "Contact number must be at least 10 digits").max(10, "Contact number must be at most 10 digits");
export const projectNameSchema = z.string().min(1, "Project name cannot be empty");
export const billableSchema = z.boolean();
export const timeSheetsSchema = z.boolean();
export const isScrumProjectSchema = z.boolean();