import { CREATED, OK } from '../constants/http';
import {
  createProjectFromUiSchema,
  createProjectNormalizedSchema,
} from '../schemas/project.schema';
import { createProject, listMyProjects, listProjects } from '../services/project.service';
import { catchErrors } from '../utils/error';
import { UserRole } from '@tms/shared';

export const createHandler = catchErrors(async (req, res) => {
  const parsedUi = createProjectFromUiSchema.parse(req.body);
  const normalized = createProjectNormalizedSchema.parse({
    projectName: parsedUi.projectName,
    clientName: parsedUi.clientName,
    billable: parsedUi.billable,
    employees: parsedUi.employees,
    supervisor: parsedUi.supervisor ?? null,
  });

  const project = await createProject(normalized, req.userId);

  return res.status(CREATED).json(project);
});

export const listHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;
  const result = await listProjects(userId, userRole);
  return res.status(OK).json(result);
});

export const listMyProjectsHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;
  console.log('User ID in listMyProjectsHandler:', userId);
  const result = await listMyProjects(userId);
  return res.status(OK).json(result);
});

