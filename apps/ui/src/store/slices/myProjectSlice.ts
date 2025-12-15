import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../config/apiClient";
import { MyProject } from "../../interfaces/project";
import { createProject as createProjectAPI } from "../../api/project";

export interface MyProjectsState {
  myProjects: MyProject[];
  loading: boolean;
  error: string | null;
}

const initialState: MyProjectsState = {
  myProjects: [],
  loading: false,
  error: null,
};

export const fetchMyProjects = createAsyncThunk<
  MyProject[], // return type
  void,        // argument
  { rejectValue: string } // error type
>(
  "myProjects/fetchMyProjects",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/api/project/my-projects");
      return res.data.projects; //  IMPORTANT: return only the array
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load my projects"
      );
    }
  }
);

export const createProject = createAsyncThunk<
  MyProject, // return type
  { projectName: string; clientName?: string; billable?: string },
  { rejectValue: string }
>(
  "myProjects/createProject",
  async (params, thunkAPI) => {
    try {
      const res = await createProjectAPI(params);
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create project"
      );
    }
  }
);

const myProjectSlice = createSlice({
  name: "myProjects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMyProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      fetchMyProjects.fulfilled,
      (state, action: PayloadAction<MyProject[]>) => {
        state.loading = false;
        state.myProjects = action.payload;
      }
    );

    builder.addCase(fetchMyProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to load projects";
    });

    builder.addCase(createProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      createProject.fulfilled,
      (state, action: PayloadAction<MyProject>) => {
        state.loading = false;
        state.myProjects.push(action.payload);
      }
    );

    builder.addCase(createProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to create project";
    });
  },
});

export default myProjectSlice.reducer;
