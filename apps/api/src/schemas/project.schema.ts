import { z } from 'zod';
import { projectNameSchema } from './main.schema';
import { BillableType } from '@tms/shared';


export const createProjectFromUiSchema = z.object({
  projectName: projectNameSchema,
  description: z.string().min(1, 'Description is required'),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  costCenter: z.string().min(1, 'Cost center is required'),
  projectType: z.string().min(1, 'Project type is required'),
 isPublic: z.string().min(1, 'Project visibility is required'),
  billable: z.enum(BillableType),
  employees: z.array(z.string()).default([]),
  supervisor: z.string().nullable().optional(),
});

// Internal normalized schema used by service
export const createProjectNormalizedSchema = z.object({
  projectName: projectNameSchema,
  description: z.string().min(1, 'Description is required'),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  costCenter: z.string().min(1, 'Cost center is required'),
  projectType: z.string().min(1, 'Project type is required'),
  isPublic: z.boolean(),
  billable: z.enum(BillableType),
  employees: z.array(z.string()).default([]),
  supervisor: z.string().nullable().optional(),
});

export type CreateProjectNormalized = z.infer<typeof createProjectNormalizedSchema>;