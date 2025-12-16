import { z } from 'zod';

// Team name validation
export const teamNameSchema = z.string().min(1, "Team name is required").max(100, "Team name must be at most 100 characters");

// Employee IDs validation 
export const employeeIdsSchema = z.array(z.string().min(1, "Employee ID cannot be empty")).optional();

// Supervisor ID validation 
export const supervisorIdSchema = z.string().min(1, "Supervisor ID cannot be empty").optional().nullable();

// Complete create team schema
export const createTeamSchema = z.object({
  teamName: teamNameSchema,
  employees: employeeIdsSchema,
  supervisor: supervisorIdSchema,
  isDepartment: z.boolean().optional().default(true),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;