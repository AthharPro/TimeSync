import { string, z } from 'zod';
import { projectNameSchema } from './main.schema';
import { BillableType } from '@tms/shared';


export const createProjectFromUiSchema = z.object({
  projectName: projectNameSchema,
  clientName: z.string().min(1, 'Client name is required'),
  billable: z.enum(BillableType),
  employees: z.array(z.string()).default([]),
  supervisor: z.string().nullable().optional(),
});

// Internal normalized schema used by service
export const createProjectNormalizedSchema = z.object({
  projectName: projectNameSchema,
  clientName: z.string().min(1, 'Client name is required'),
  billable: z.enum(BillableType),
  employees: z.array(z.string()).default([]),
  supervisor: z.string().nullable().optional(),
});

export type CreateProjectNormalized = z.infer<typeof createProjectNormalizedSchema>;