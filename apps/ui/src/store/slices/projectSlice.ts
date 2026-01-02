import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { listProjects, deleteProject, updateProjectStaff, createProject as createProjectAPI } from '../../api/project';
import { IProject } from '../../interfaces/project/IProject';
import { CostCenter, ProjectType } from '../../interfaces/project/IProject';

// Serialized version of IProject for Redux storage (dates as ISO strings)
type SerializedProject = Omit<IProject, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> & {
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface ProjectState {
  projects: SerializedProject[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

// Helper function to transform backend project response to serialized project (dates as ISO strings)
const transformProject = (project: any): SerializedProject => {
  // Handle team members (employees) - may be fully populated or just IDs
  const teamMembers = (project.employees || []).map((employee: any) => {
    // Handle different shapes: string id, populated user doc, or subdocument { user, allocation }
    if (typeof employee === 'string') {
      return {
        id: employee.toString(),
        name: '',
        role: '',
        email: undefined,
        avatar: undefined,
        allocation: 0,
      };
    }

    // If it's a subdocument with user and allocation
    if (employee && (employee.user || employee.user === 0)) {
      const user = employee.user;
      return {
        id: user?.id || user?._id || (user && typeof user === 'string' ? user : undefined),
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || user?.email || 'Unknown',
        role: user?.designation || '',
        email: user?.email,
        avatar: undefined,
        allocation: employee.allocation ?? 0,
      };
    }

    // Fully populated employee doc (legacy shape)
    return {
      id: employee.id || employee._id,
      name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown',
      role: employee.designation || '',
      email: employee.email,
      avatar: undefined,
      allocation: employee.allocation ?? 0,
    };
  });

  // Handle project manager (supervisor) - may be fully populated, just an ID, or null
  let supervisor: string | null = null;
  if (project.supervisor) {
    if (typeof project.supervisor === 'string') {
      // Just an ID
      supervisor = project.supervisor;
    } else if (project.supervisor && (project.supervisor.id || project.supervisor._id)) {
      // Fully populated supervisor - extract the ID
      supervisor = project.supervisor.id || project.supervisor._id;
    }
  }

  // Map billable type
  const billable = project.billable === 'Billable' || project.billable === 'BILLABLE';

  // Determine status based on project.status (boolean)
  // Note: endDate is not in the backend model, so we only check status
  let status: 'Active' | 'Completed' | 'On Hold' = 'Active';
  if (!project.status) {
    status = 'On Hold';
  }

  // Store dates as ISO strings for Redux serialization
  const now = new Date().toISOString();
  
  return {
    id: project.id || project._id,
    projectName: project.projectName,
    costCenter: (project.costCenter as CostCenter) || 'Sri Lanka',
    clientName: project.clientName || '',
    projectVisibility: project.isPublic ? 'Public' : 'Private',
    description: project.description || '',
    projectType: (project.projectType as ProjectType) || 'T&M',
    supervisor: supervisor,
    teamMembers,
    startDate: project.startDate ? (typeof project.startDate === 'string' ? project.startDate : new Date(project.startDate).toISOString()) : (project.createdAt ? (typeof project.createdAt === 'string' ? project.createdAt : new Date(project.createdAt).toISOString()) : now),
    endDate: project.endDate ? (typeof project.endDate === 'string' ? project.endDate : new Date(project.endDate).toISOString()) : null,
    billable,
    status,
    createdAt: project.createdAt ? (typeof project.createdAt === 'string' ? project.createdAt : new Date(project.createdAt).toISOString()) : now,
    updatedAt: project.updatedAt ? (typeof project.updatedAt === 'string' ? project.updatedAt : new Date(project.updatedAt).toISOString()) : now,
  };
};

// Fetch all projects
export const fetchProjects = createAsyncThunk<
  SerializedProject[],
  void,
  { rejectValue: string }
>('project/fetchProjects', async (_, thunkAPI) => {
  try {
    const response = await listProjects();
    
    // The backend returns { projects: [...] }
    // listProjectsAPI() returns response.data which should be { projects: [...] }
    if (!response) {
      console.error('Empty response from API');
      return thunkAPI.rejectWithValue('Empty response from server');
    }
    
    // Handle response structure: response should be { projects: [...] }
    const projectsArray = response.projects;
    
    if (!projectsArray) {
      console.error('No projects array in response:', response);
      return thunkAPI.rejectWithValue('Invalid response structure from server');
    }
    
    if (!Array.isArray(projectsArray)) {
      console.error('Projects is not an array:', projectsArray);
      return thunkAPI.rejectWithValue('Invalid response structure from server');
    }
    
    // Transform projects with error handling
    const transformedProjects = projectsArray.map((project, index) => {
      try {
        return transformProject(project);
      } catch (error) {
        console.error(`Error transforming project at index ${index}:`, error, project);
        // Return a minimal valid project object to prevent complete failure
        const now = new Date().toISOString();
        return {
          id: project.id || project._id || `error-${index}`,
          projectName: project.projectName || 'Unknown Project',
          costCenter: 'Sri Lanka' as CostCenter,
          clientName: project.clientName || '',
          projectVisibility: 'Private' as const,
          description: project.description || '',
          projectType: 'T&M' as ProjectType,
          supervisor: null,
          teamMembers: [],
          startDate: now,
          endDate: null,
          billable: false,
          status: 'Active' as const,
          createdAt: now,
          updatedAt: now,
        };
      }
    });
    
    return transformedProjects;
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch projects';
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Delete project
export const deleteProjectAction = createAsyncThunk<
  string, // projectId
  string, // projectId
  { rejectValue: string }
>('project/deleteProject', async (projectId, thunkAPI) => {
  try {
    await deleteProject(projectId);
    return projectId;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to delete project'
    );
  }
});

// Create project
export const createProjectAction = createAsyncThunk<
  SerializedProject,
  {
    projectName: string;
    description: string;
    clientName?: string;
    billable?: string;
    costCenter?: string;
    projectType?: string;
    projectVisibility?: string;
    employees?: (string | { user: string; allocation?: number })[];
    supervisor?: string | null;
  },
  { rejectValue: string }
>('project/createProject', async (params, thunkAPI) => {
  try {
    const response = await createProjectAPI(params);
    // API.post returns axios response, so response.data contains the backend response
    // Backend returns { project: {...} }
    const projectData = response.data?.project;
    if (!projectData) {
      console.error('Invalid response structure:', response.data);
      return thunkAPI.rejectWithValue('Invalid response structure from server');
    }
    return transformProject(projectData);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Failed to create project'
    );
  }
});

// Update project staff
export const updateProjectStaffAction = createAsyncThunk<
  SerializedProject,
  { projectId: string; employees?: { user: string; allocation?: number }[]; supervisor?: string | null },
  { rejectValue: string }
>('project/updateProjectStaff', async (params, thunkAPI) => {
  try {
    const response = await updateProjectStaff(params.projectId, {
      employees: params.employees,
      supervisor: params.supervisor,
    });
    // response already is response.data (contains { project: ... })
    if (!response || !response.project) {
      console.error('Invalid response structure:', response);
      return thunkAPI.rejectWithValue('Invalid response structure from server');
    }
    return transformProject(response.project);
  } catch (error: any) {
    console.error('Error updating project staff:', error);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || 'Failed to update project staff'
    );
  }
});

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setProjects: (state, action: PayloadAction<SerializedProject[]>) => {
      state.projects = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<SerializedProject[]>) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch projects';
      })
      // Delete project - don't set loading to avoid blocking the UI
      .addCase(deleteProjectAction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProjectAction.fulfilled, (state, action: PayloadAction<string>) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProjectAction.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete project';
      })
      // Update project staff - don't set loading to avoid blocking the UI
      .addCase(updateProjectStaffAction.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProjectStaffAction.fulfilled, (state, action: PayloadAction<SerializedProject>) => {
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProjectStaffAction.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update project staff';
      })
      // Create project - don't set loading to avoid blocking the UI
      .addCase(createProjectAction.pending, (state) => {
        state.error = null;
      })
      .addCase(createProjectAction.fulfilled, (state, action: PayloadAction<SerializedProject>) => {
        state.projects.unshift(action.payload); // Add to beginning of array
      })
      .addCase(createProjectAction.rejected, (state, action) => {
        state.error = action.payload || 'Failed to create project';
      });
  },
});

export default projectSlice.reducer;
export const { clearError, setProjects } = projectSlice.actions;


