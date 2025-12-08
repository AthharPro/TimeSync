import { z } from 'zod';

export const createTaskSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  taskName: z.string().min(1, "Task name is required"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
