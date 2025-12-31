import { CREATED, OK } from '../constants/http';
import { catchErrors } from '../utils/error';
import { createTeam, listTeams, listTeamsForUser, deleteTeam, listMyMemberTeams, listSupervisedTeams, listAllSupervisedTeams, updateTeamStaff } from '../services/team.service';


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
  
  console.log('updateStaffHandler - Team ID:', id);
  console.log('updateStaffHandler - Request body:', req.body);
  console.log('updateStaffHandler - Members:', members);
  console.log('updateStaffHandler - Members type:', typeof members, Array.isArray(members));
  console.log('updateStaffHandler - Supervisor:', supervisor);
  
  const result = await updateTeamStaff(id, { members, supervisor });
  return res.status(OK).json(result);
});

export const deleteTeamHandler = catchErrors(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await deleteTeam(id);
  return res.status(OK).json(result);
});


