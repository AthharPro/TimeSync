import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getAllTeams,
  getTeamsForUser,
  getMyMemberTeams,
  getSupervisedTeams,
  getAllSupervisedTeams,
  createTeam,
  updateTeamStaff,
  deleteTeam,
  type CreateTeamParams,
  type UpdateTeamStaffParams,
} from '../../api/team';
import { ITeam } from '../../interfaces/team';

export interface TeamState {
  teams: ITeam[];
  myMemberTeams: ITeam[];
  supervisedTeams: ITeam[];
  allSupervisedTeams: ITeam[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teams: [],
  myMemberTeams: [],
  supervisedTeams: [],
  allSupervisedTeams: [],
  loading: false,
  error: null,
};

// Helper function to transform backend team response to frontend ITeam
const transformTeam = (team: any): ITeam => {
  // Handle members - may be fully populated or just IDs
  const members = (team.members || []).map((member: any) => {
    if (typeof member === 'string' || (member && !member.firstName)) {
      // Just an ID, return minimal info
      return {
        id: member.toString(),
        name: '',
        designation: undefined,
        email: undefined,
      };
    }
    // Fully populated member
    return {
      id: member.id || member._id,
      name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown',
      designation: member.designation,
      email: member.email,
    };
  });

  // Handle supervisor - may be fully populated, just an ID, or null
  let supervisor = null;
  if (team.supervisor) {
    if (typeof team.supervisor === 'string' || (team.supervisor && !team.supervisor.firstName)) {
      // Just an ID
      supervisor = {
        id: team.supervisor.toString(),
        name: '',
        designation: undefined,
        email: undefined,
      };
    } else {
      // Fully populated supervisor
      supervisor = {
        id: team.supervisor.id || team.supervisor._id,
        name: `${team.supervisor.firstName || ''} ${team.supervisor.lastName || ''}`.trim() || 'Unknown',
        designation: team.supervisor.designation,
        email: team.supervisor.email,
      };
    }
  }

  return {
    id: team.id || team._id,
    teamName: team.teamName,
    members,
    supervisor,
  };
};

// Fetch all teams (Admin/SupervisorAdmin)
export const fetchAllTeams = createAsyncThunk<
  ITeam[],
  void,
  { rejectValue: string }
>('team/fetchAllTeams', async (_, thunkAPI) => {
  try {
    const response = await getAllTeams();
    return response.teams.map(transformTeam);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to fetch teams'
    );
  }
});

// Fetch teams for current user
export const fetchTeamsForUser = createAsyncThunk<
  ITeam[],
  void,
  { rejectValue: string }
>('team/fetchTeamsForUser', async (_, thunkAPI) => {
  try {
    const response = await getTeamsForUser();
    return response.teams.map(transformTeam);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to fetch teams for user'
    );
  }
});

// Fetch teams where user is a member
export const fetchMyMemberTeams = createAsyncThunk<
  ITeam[],
  void,
  { rejectValue: string }
>('team/fetchMyMemberTeams', async (_, thunkAPI) => {
  try {
    const response = await getMyMemberTeams();
    return response.teams.map(transformTeam);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to fetch member teams'
    );
  }
});

// Fetch teams supervised by current user
export const fetchSupervisedTeams = createAsyncThunk<
  ITeam[],
  void,
  { rejectValue: string }
>('team/fetchSupervisedTeams', async (_, thunkAPI) => {
  try {
    const response = await getSupervisedTeams();
    return response.teams.map(transformTeam);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to fetch supervised teams'
    );
  }
});

// Fetch all supervised teams (including non-departments)
export const fetchAllSupervisedTeams = createAsyncThunk<
  ITeam[],
  void,
  { rejectValue: string }
>('team/fetchAllSupervisedTeams', async (_, thunkAPI) => {
  try {
    const response = await getAllSupervisedTeams();
    return response.teams.map(transformTeam);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to fetch all supervised teams'
    );
  }
});

// Create a new team
export const createTeamAction = createAsyncThunk<
  ITeam,
  CreateTeamParams,
  { rejectValue: string }
>('team/createTeam', async (params, thunkAPI) => {
  try {
    const response = await createTeam(params);
    return transformTeam(response.team);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to create team'
    );
  }
});

// Update team staff
export const updateTeamStaffAction = createAsyncThunk<
  ITeam,
  { teamId: string; params: UpdateTeamStaffParams },
  { rejectValue: string }
>('team/updateTeamStaff', async ({ teamId, params }, thunkAPI) => {
  try {
    const response = await updateTeamStaff(teamId, params);
    return transformTeam(response.team);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to update team staff'
    );
  }
});

// Delete a team
export const deleteTeamAction = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('team/deleteTeam', async (teamId, thunkAPI) => {
  try {
    await deleteTeam(teamId);
    return teamId;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to delete team'
    );
  }
});

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTeams: (state, action: PayloadAction<ITeam[]>) => {
      state.teams = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all teams
      .addCase(fetchAllTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTeams.fulfilled, (state, action: PayloadAction<ITeam[]>) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchAllTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch teams';
      })
      // Fetch teams for user
      .addCase(fetchTeamsForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamsForUser.fulfilled, (state, action: PayloadAction<ITeam[]>) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeamsForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch teams for user';
      })
      // Fetch my member teams
      .addCase(fetchMyMemberTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyMemberTeams.fulfilled, (state, action: PayloadAction<ITeam[]>) => {
        state.loading = false;
        state.myMemberTeams = action.payload;
      })
      .addCase(fetchMyMemberTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch member teams';
      })
      // Fetch supervised teams
      .addCase(fetchSupervisedTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisedTeams.fulfilled, (state, action: PayloadAction<ITeam[]>) => {
        state.loading = false;
        state.supervisedTeams = action.payload;
      })
      .addCase(fetchSupervisedTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch supervised teams';
      })
      // Fetch all supervised teams
      .addCase(fetchAllSupervisedTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSupervisedTeams.fulfilled, (state, action: PayloadAction<ITeam[]>) => {
        state.loading = false;
        state.allSupervisedTeams = action.payload;
      })
      .addCase(fetchAllSupervisedTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch all supervised teams';
      })
      // Create team
      .addCase(createTeamAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamAction.fulfilled, (state, action: PayloadAction<ITeam>) => {
        state.loading = false;
        state.teams.push(action.payload);
      })
      .addCase(createTeamAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create team';
      })
      // Update team staff
      .addCase(updateTeamStaffAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeamStaffAction.fulfilled, (state, action: PayloadAction<ITeam>) => {
        state.loading = false;
        const index = state.teams.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        // Also update in other arrays if present
        const memberIndex = state.myMemberTeams.findIndex((t) => t.id === action.payload.id);
        if (memberIndex !== -1) {
          state.myMemberTeams[memberIndex] = action.payload;
        }
        const supervisedIndex = state.supervisedTeams.findIndex((t) => t.id === action.payload.id);
        if (supervisedIndex !== -1) {
          state.supervisedTeams[supervisedIndex] = action.payload;
        }
        const allSupervisedIndex = state.allSupervisedTeams.findIndex((t) => t.id === action.payload.id);
        if (allSupervisedIndex !== -1) {
          state.allSupervisedTeams[allSupervisedIndex] = action.payload;
        }
      })
      .addCase(updateTeamStaffAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update team staff';
      })
      // Delete team
      .addCase(deleteTeamAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeamAction.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.teams = state.teams.filter((t) => t.id !== action.payload);
        state.myMemberTeams = state.myMemberTeams.filter((t) => t.id !== action.payload);
        state.supervisedTeams = state.supervisedTeams.filter((t) => t.id !== action.payload);
        state.allSupervisedTeams = state.allSupervisedTeams.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTeamAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete team';
      });
  },
});

export default teamSlice.reducer;
export const { clearError, setTeams } = teamSlice.actions;

