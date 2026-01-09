import { CREATED, OK } from '../constants/http';
import { catchErrors } from '../utils/error';
import { createTeam, listTeams, listTeamsForUser, deleteTeam, listMyMemberTeams, listSupervisedTeams, listAllSupervisedTeams, updateTeamStaff, updateTeamDetails } from '../services/team.service';


export const createTeamHandler = catchErrors(async (req, res) => {
  const { teamName, employees, supervisor, isDepartment } = req.body as any;

  

  const normalized = {
    teamName,
    members: Array.isArray(employees) ? employees : [],
    supervisor: supervisor ?? null,
    isDepartment: isDepartment ?? true,
  };



  const team = await createTeam(normalized, req.userId);
  
  
  
  return res.status(CREATED).json(team);
});

export const listTeamsHandler = catchErrors(async (_req, res) => {
  const data = await listTeams();
  return res.json(data);
});

export const listTeamsForUserHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;
  const userRole = req.userRole as any;
  const data = await listTeamsForUser(userId, userRole);
  return res.json(data);
});

export const listMyMemberTeamsHandler = catchErrors(async (req, res) => {
  const userId = req.userId as string;
  const data = await listMyMemberTeams(userId);
  return res.json(data);
});

export const listSupervisedTeamsHandler = catchErrors(async (req, res) => {
  const supervisorId = req.userId as string;
  const data = await listSupervisedTeams(supervisorId);
  return res.json(data);
});

export const listAllSupervisedTeamsHandler = catchErrors(async (req, res) => {
  const supervisorId = req.userId as string;
  const data = await listAllSupervisedTeams(supervisorId);
  return res.json(data);
});

export const updateStaffHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const { members, supervisor } = req.body as {
    members?: string[];
    supervisor?: string | null;
  };
  
  const performedBy = req.userId as string; // Get the authenticated user ID
  const result = await updateTeamStaff(id, { members, supervisor }, performedBy);
  return res.status(OK).json(result);
});

export const updateTeamDetailsHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const { teamName, isDepartment } = req.body as {
    teamName?: string;
    isDepartment?: boolean;
  };
  
  const performedBy = req.userId as string;
  const result = await updateTeamDetails(id, { teamName, isDepartment }, performedBy);
  return res.status(OK).json(result);
});

export const deleteTeamHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await deleteTeam(id);
  return res.status(OK).json(result);
});


