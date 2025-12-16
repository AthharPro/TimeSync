import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import {
  fetchAllTeams,
  fetchTeamsForUser,
  fetchMyMemberTeams,
  fetchSupervisedTeams,
  fetchAllSupervisedTeams,
  createTeamAction,
  updateTeamStaffAction,
  deleteTeamAction,
  clearError,
} from '../../store/slices/teamSlice';
import type { CreateTeamParams, UpdateTeamStaffParams } from '../../api/team';
import { ITeam } from '../../interfaces/team';

export interface IUseTeamReturn {
  // States
  teams: ITeam[];
  myMemberTeams: ITeam[];
  supervisedTeams: ITeam[];
  allSupervisedTeams: ITeam[];
  loading: boolean;
  error: string | null;

  // Actions
  loadAllTeams: () => Promise<void>;
  loadTeamsForUser: () => Promise<void>;
  loadMyMemberTeams: () => Promise<void>;
  loadSupervisedTeams: () => Promise<void>;
  loadAllSupervisedTeams: () => Promise<void>;
  createTeam: (params: CreateTeamParams) => Promise<ITeam>;
  updateTeamStaff: (teamId: string, params: UpdateTeamStaffParams) => Promise<ITeam>;
  deleteTeam: (teamId: string) => Promise<void>;
  clearError: () => void;
}

export const useTeam = (): IUseTeamReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux store
  const teams = useSelector((state: RootState) => state.team.teams);
  const myMemberTeams = useSelector((state: RootState) => state.team.myMemberTeams);
  const supervisedTeams = useSelector((state: RootState) => state.team.supervisedTeams);
  const allSupervisedTeams = useSelector((state: RootState) => state.team.allSupervisedTeams);
  const loading = useSelector((state: RootState) => state.team.loading);
  const error = useSelector((state: RootState) => state.team.error);

  // Load all teams (Admin/SupervisorAdmin)
  const loadAllTeams = useCallback(async () => {
    await dispatch(fetchAllTeams());
  }, [dispatch]);

  // Load teams for current user
  const loadTeamsForUser = useCallback(async () => {
    await dispatch(fetchTeamsForUser());
  }, [dispatch]);

  // Load teams where user is a member
  const loadMyMemberTeams = useCallback(async () => {
    await dispatch(fetchMyMemberTeams());
  }, [dispatch]);

  // Load teams supervised by current user
  const loadSupervisedTeams = useCallback(async () => {
    await dispatch(fetchSupervisedTeams());
  }, [dispatch]);

  // Load all supervised teams (including non-departments)
  const loadAllSupervisedTeams = useCallback(async () => {
    await dispatch(fetchAllSupervisedTeams());
  }, [dispatch]);

  // Create a new team
  const createTeam = useCallback(
    async (params: CreateTeamParams): Promise<ITeam> => {
      const result = await dispatch(createTeamAction(params));
      if (createTeamAction.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload || 'Failed to create team');
      }
    },
    [dispatch]
  );

  // Update team staff
  const updateTeamStaff = useCallback(
    async (teamId: string, params: UpdateTeamStaffParams): Promise<ITeam> => {
      const result = await dispatch(updateTeamStaffAction({ teamId, params }));
      if (updateTeamStaffAction.fulfilled.match(result)) {
        return result.payload;
      } else {
        throw new Error(result.payload || 'Failed to update team staff');
      }
    },
    [dispatch]
  );

  // Delete a team
  const deleteTeam = useCallback(
    async (teamId: string): Promise<void> => {
      const result = await dispatch(deleteTeamAction(teamId));
      if (deleteTeamAction.rejected.match(result)) {
        throw new Error(result.payload || 'Failed to delete team');
      }
    },
    [dispatch]
  );

  // Clear error
  const clearErrorAction = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // States
    teams,
    myMemberTeams,
    supervisedTeams,
    allSupervisedTeams,
    loading,
    error,

    // Actions
    loadAllTeams,
    loadTeamsForUser,
    loadMyMemberTeams,
    loadSupervisedTeams,
    loadAllSupervisedTeams,
    createTeam,
    updateTeamStaff,
    deleteTeam,
    clearError: clearErrorAction,
  };
};

