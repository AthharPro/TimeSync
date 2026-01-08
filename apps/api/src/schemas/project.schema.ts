import { z } from 'zod';
import { projectNameSchema } from './main.schema';
import { BillableType } from '@tms/shared';


export const createProjectFromUiSchema = z.object({
  projectName: projectNameSchema,
  description: z.string().min(1, 'Description is required'),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  clientName: z.string().optional(),
  costCenter: z.string().optional(),
  projectType: z.string().optional(),
  isPublic: z.boolean(),
  billable: z.enum(BillableType).optional(),
  employees: z
    .array(
      z.object({
        user: z.string(),
        allocation: z.number().min(0).max(100).optional().default(0),
      })
    )
    .default([]),
  supervisor: z.string().nullable().optional(),
}).refine(
  (data) => {
    // For private projects, require costCenter, projectType, clientName, and billable
    if (!data.isPublic) {
      return (
        data.costCenter &&
        data.costCenter.trim().length > 0 &&
        data.projectType &&
        data.projectType.trim().length > 0 &&
        data.clientName &&
        data.clientName.trim().length > 0 &&
        data.billable !== undefined
      );
    }
    return true;
  },
  {
    message: 'Cost center, project type, client name, and billable are required for private projects',
    path: ['isPublic'],
  }
);

// Internal normalized schema used by service
export const createProjectNormalizedSchema = z.object({
  projectName: projectNameSchema,
  description: z.string().min(1, 'Description is required'),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  clientName: z.string().optional(),
  costCenter: z.string().optional(),
  projectType: z.string().optional(),
  isPublic: z.boolean(),
  billable: z.enum(BillableType).optional(),
  employees: z
    .array(
      z.object({
        user: z.string(),
        allocation: z.number().min(0).max(100).optional().default(0),
      })
    )
    .default([]),
  supervisor: z.string().nullable().optional(),
}).refine(
  (data) => {
    // For private projects, require costCenter, projectType, clientName, and billable
    if (!data.isPublic) {
      return (
        data.costCenter &&
        data.costCenter.trim().length > 0 &&
        data.projectType &&
        data.projectType.trim().length > 0 &&
        data.clientName &&
        data.clientName.trim().length > 0 &&
        data.billable !== undefined
      );
    }
    return true;
  },
  {
    message: 'Cost center, project type, client name, and billable are required for private projects',
    path: ['isPublic'],
  }
);

export type CreateProjectNormalized = z.infer<typeof createProjectNormalizedSchema>;

// Schema for updating project details (all fields optional)
export const updateProjectDetailsSchema = z.object({
  projectName: projectNameSchema.optional(),
  description: z.string().min(1, 'Description is required').optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  clientName: z.string().optional(),
  costCenter: z.string().optional(),
  projectType: z.string().optional(),
  isPublic: z.boolean().optional(),
  billable: z.enum(BillableType).optional(),
});

export type UpdateProjectDetails = z.infer<typeof updateProjectDetailsSchema>;
