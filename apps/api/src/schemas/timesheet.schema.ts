import { z } from 'zod';

export const createTimesheetSchema = z.object({
  date: z.coerce.date(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  teamId: z.string().optional(),
  billable: z.string().optional(),
  description: z.string().optional(),
  hours: z.float32().optional(),
});

export type CreateTimesheetInput = z.infer<typeof createTimesheetSchema>;

export const updateTimesheetSchema = z.object({
  date: z.coerce.date().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  teamId: z.string().optional(),
  billable: z.string().optional(),
  description: z.string().optional(),
  hours: z.number().optional(),
});

export const getTimesheetsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type GetTimesheetsInput = z.infer<typeof getTimesheetsSchema>;
