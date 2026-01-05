import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  getReportMetadata,
  getSupervisedEmployees,
  generateDetailedTimesheetReport,
  generateTimesheetEntriesReport,
  GenerateReportParams,
} from '../../api/report';
import { ReportFilter } from '../../interfaces/report/IReportFilter';

export interface ReportEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ReportState {
  metadata: any | null;
  supervisedEmployees: ReportEmployee[];
  loading: boolean;
  error: string | null;
  generatingReport: boolean;
  reportError: string | null;
}

const initialState: ReportState = {
  metadata: null,
  supervisedEmployees: [],
  loading: false,
  error: null,
  generatingReport: false,
  reportError: null,
};

// Async thunk for fetching report metadata
export const fetchReportMetadata = createAsyncThunk(
  'report/fetchMetadata',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getReportMetadata();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch report metadata'
      );
    }
  }
);

// Async thunk for fetching supervised employees
export const fetchSupervisedEmployees = createAsyncThunk(
  'report/fetchSupervisedEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSupervisedEmployees();
      return response.data.employees || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch supervised employees'
      );
    }
  }
);

// Async thunk for generating detailed timesheet report
export const generateDetailedReport = createAsyncThunk(
  'report/generateDetailed',
  async (params: GenerateReportParams, { rejectWithValue }) => {
    try {
      const result = await generateDetailedTimesheetReport(params.filter, params.format);
      return { data: result, params };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to generate detailed report'
      );
    }
  }
);

// Async thunk for generating timesheet entries report
export const generateEntriesReport = createAsyncThunk(
  'report/generateEntries',
  async (params: GenerateReportParams, { rejectWithValue }) => {
    try {
      const result = await generateTimesheetEntriesReport(params.filter, params.format);
      return { data: result, params };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to generate entries report'
      );
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.reportError = null;
    },
    clearReportData: (state) => {
      state.generatingReport = false;
      state.reportError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metadata
      .addCase(fetchReportMetadata.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportMetadata.fulfilled, (state, action) => {
        state.loading = false;
        state.metadata = action.payload;
        state.error = null;
      })
      .addCase(fetchReportMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch supervised employees
      .addCase(fetchSupervisedEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisedEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.supervisedEmployees = action.payload;
        state.error = null;
      })
      .addCase(fetchSupervisedEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Generate detailed report
      .addCase(generateDetailedReport.pending, (state) => {
        state.generatingReport = true;
        state.reportError = null;
      })
      .addCase(generateDetailedReport.fulfilled, (state) => {
        state.generatingReport = false;
        state.reportError = null;
      })
      .addCase(generateDetailedReport.rejected, (state, action) => {
        state.generatingReport = false;
        state.reportError = action.payload as string;
      })
      // Generate entries report
      .addCase(generateEntriesReport.pending, (state) => {
        state.generatingReport = true;
        state.reportError = null;
      })
      .addCase(generateEntriesReport.fulfilled, (state) => {
        state.generatingReport = false;
        state.reportError = null;
      })
      .addCase(generateEntriesReport.rejected, (state, action) => {
        state.generatingReport = false;
        state.reportError = action.payload as string;
      });
  },
});

export default reportSlice.reducer;
export const { clearError, clearReportData } = reportSlice.actions;

