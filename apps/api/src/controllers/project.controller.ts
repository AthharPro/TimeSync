import { CREATED, OK } from '../constants/http';
import {
  createProjectFromUiSchema,
  createProjectNormalizedSchema,
} from '../schemas/project.schema';
import { catchErrors } from '../utils/error';
import {
  createProject,
  listProjects,
  listMyProjects,
  updateProjectStaff,
  softDeleteProject,
  activateProject,
  listSupervisedProjects,
} from '../services/project.service';
import { UserRole } from '@tms/shared';


export const createHandler = catchErrors(async (req, res) => {
  const parsedUi = createProjectFromUiSchema.parse(req.body);
  
  const normalized = createProjectNormalizedSchema.parse({
    projectName: parsedUi.projectName,
    description: parsedUi.description,
    startDate: parsedUi.startDate,
    endDate: parsedUi.endDate,
    clientName: parsedUi.clientName,
    costCenter: parsedUi.costCenter,
    isPublic: parsedUi.isPublic,
    projectType: parsedUi.projectType,
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
  const result = await listMyProjects(userId);
  return res.status(OK).json(result);
});

export const updateStaffHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const { employees, supervisor } = req.body as {
    employees?: { user: string; allocation?: number }[];
    supervisor?: string | null;
  };
  const performedBy = req.userId as string; // Get the authenticated user ID
  const result = await updateProjectStaff(id, { employees, supervisor }, performedBy);
  return res.status(OK).json(result);
});

export const deleteHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await softDeleteProject(id);
  return res.status(OK).json(result);
});

export const activateHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await activateProject(id);
  return res.status(OK).json(result);
});

export const listSupervisedProjectsHandler = catchErrors(async (req, res) => {
  const supervisorId = req.userId as string;
  const result = await listSupervisedProjects(supervisorId);
  return res.status(OK).json(result);
});


