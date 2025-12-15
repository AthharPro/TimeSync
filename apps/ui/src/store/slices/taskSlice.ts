import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskAPI, Task, CreateTaskParams } from '../../api/task';

interface TaskState {
  tasksByProject: Record<string, Task[]>;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasksByProject: {},
  loading: false,
  error: null,
};

export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchByProject',
  async (projectId: string) => {
    const tasks = await taskAPI.getTasksByProject(projectId);
    return { projectId, tasks };
  }
);

export const createNewTask = createAsyncThunk(
  'tasks/create',
  async (params: CreateTaskParams) => {
    const task = await taskAPI.createTask(params);
    return task;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksForProject: (state, action: PayloadAction<string>) => {
      delete state.tasksByProject[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasksByProject[action.payload.projectId] = action.payload.tasks;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(createNewTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.loading = false;
        const projectId = action.payload.projectId;
        if (state.tasksByProject[projectId]) {
          state.tasksByProject[projectId].push(action.payload);
        } else {
          state.tasksByProject[projectId] = [action.payload];
        }
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      });
  },
});

export const { clearTasksForProject } = taskSlice.actions;
export default taskSlice.reducer;
