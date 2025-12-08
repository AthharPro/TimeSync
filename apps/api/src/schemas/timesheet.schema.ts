import { z } from 'zod';

export const createTimesheetSchema = z.object({
  date: z.coerce.date(),
  projectId: z.string().min(1, "Project ID is required"),
  taskId: z.string().min(1, "Task ID is required"),
  billable: z.string(),
  description: z.string().optional(),
  hours: z.float32().optional(),
});

export type CreateTimesheetInput = z.infer<typeof createTimesheetSchema>;

export const updateTimesheetSchema = z.object({
  id: z.string(),
  date: z.date().optional(),
  projectId: z.string().min(1, "Project ID is required").optional,
  taskId: z.string().min(1, "Task ID is required").optional(),
  billable: z.string().optional,
  description: z.string().optional().optional,
  hours: z.float32().optional().optional,
});
