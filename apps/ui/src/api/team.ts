import api from '../config/apiClient';

export interface CreateTeamParams {
  teamName: string;
  employees?: string[];
  supervisor?: string | null;
  isDepartment?: boolean;
}

export interface UpdateTeamStaffParams {
  members?: string[];
  supervisor?: string | null;
}

export interface UpdateTeamDetailsParams {
  teamName?: string;
  isDepartment?: boolean;
}

export interface TeamResponse {
  team: {
    _id: string;
    id: string;
    teamName: string;
    members: any[];
    supervisor: any;
    status: boolean;
    isDepartment: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface TeamsResponse {
  teams: TeamResponse['team'][];
}

// Get all teams (Admin/SupervisorAdmin only)
export const getAllTeams = async (): Promise<TeamsResponse> => {
  const response = await api.get('/api/team');
  return response.data;
};

// Get teams for current user (based on role)
export const getTeamsForUser = async (): Promise<TeamsResponse> => {
  const response = await api.get('/api/team/my-teams');
  return response.data;
};

// Get teams where user is a member
export const getMyMemberTeams = async (): Promise<TeamsResponse> => {
  const response = await api.get('/api/team/my-member-teams');
  return response.data;
};

// Get teams supervised by current user
export const getSupervisedTeams = async (): Promise<TeamsResponse> => {
  const response = await api.get('/api/team/supervised');
  return response.data;
};

// Get all supervised teams (including non-departments)
export const getAllSupervisedTeams = async (): Promise<TeamsResponse> => {
  const response = await api.get('/api/team/supervised-all');
  return response.data;
};

// Create a new team
export const createTeam = async (params: CreateTeamParams): Promise<TeamResponse> => {
  const response = await api.post('/api/team', params);
  return response.data;
};

// Update team staff (members and supervisor)
export const updateTeamStaff = async (
  teamId: string,
  params: UpdateTeamStaffParams
): Promise<TeamResponse> => {
  const response = await api.put(`/api/team/${teamId}/staff`, params);
  return response.data;
};

// Update team details (name and isDepartment)
export const updateTeamDetails = async (
  teamId: string,
  params: UpdateTeamDetailsParams
): Promise<TeamResponse> => {
  const response = await api.put(`/api/team/${teamId}`, params);
  return response.data;
};

// Delete a team
export const deleteTeam = async (teamId: string): Promise<{ teamId: string }> => {
  const response = await api.delete(`/api/team/${teamId}`);
  return response.data;
};

