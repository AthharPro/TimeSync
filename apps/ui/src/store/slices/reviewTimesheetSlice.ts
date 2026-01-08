import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { 
  getSupervisedEmployeesForReview, 
  getEmployeeTimesheetsForReview,
  approveTimesheets,
  rejectTimesheets 
} from '../../api/review';
import type { ReviewEmployee, EmployeeTimesheet } from '../../api/review';
import { DailyTimesheetStatus } from '@tms/shared';

// Interface for employee with timesheets
interface IReviewEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation?: string;
  pendingTimesheetCount?: number;
  timesheets?: IReviewTimesheet[];
  timesheetsLoading?: boolean;
  timesheetsError?: string | null;
}

// Interface for timesheet entry
interface IReviewTimesheet {
  id: string;
  date: string;
  project: string;
  projectId?: string;
  isPublicProject?: boolean;
  task: string;
  taskId?: string;
  teamId?: string;
  isDepartmentTeam?: boolean;
  description: string;
  hours: number;
  billableType: string;
  status: string;
}

// State interface
interface IReviewTimesheetState {
  employees: IReviewEmployee[];
  loading: boolean;
  error: string | null;
  selectedEmployeeId: string | null;
}

// Async thunk for fetching supervised employees
export const fetchSupervisedEmployees = createAsyncThunk(
  'reviewTimesheet/fetchSupervisedEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSupervisedEmployeesForReview();
      return response.employees;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch employees');
    }
  }
);

// Async thunk for fetching employee timesheets
export const fetchEmployeeTimesheets = createAsyncThunk(
  'reviewTimesheet/fetchEmployeeTimesheets',
  async (
    params: { employeeId: string; startDate?: Date; endDate?: Date },
    { rejectWithValue }
  ) => {
    try {
      const response = await getEmployeeTimesheetsForReview(params.employeeId, {
        startDate: params.startDate,
        endDate: params.endDate,
      });
      return {
        employeeId: params.employeeId,
        timesheets: response.timesheets,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch timesheets');
    }
  }
);

// Async thunk for approving timesheets
export const approveTimesheetsThunk = createAsyncThunk(
  'reviewTimesheet/approveTimesheets',
  async (
    params: { employeeId: string; timesheetIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await approveTimesheets(params.timesheetIds);
      return {
        employeeId: params.employeeId,
        timesheetIds: params.timesheetIds,
        message: response.message,
        approved: response.approved,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to approve timesheets');
    }
  }
);

// Async thunk for rejecting timesheets
export const rejectTimesheetsThunk = createAsyncThunk(
  'reviewTimesheet/rejectTimesheets',
  async (
    params: { employeeId: string; timesheetIds: string[]; rejectionReason: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await rejectTimesheets(params.timesheetIds, params.rejectionReason);
      return {
        employeeId: params.employeeId,
        timesheetIds: params.timesheetIds,
        rejectionReason: params.rejectionReason,
        message: response.message,
        rejected: response.rejected,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to reject timesheets');
    }
  }
);

const initialState: IReviewTimesheetState = {
  employees: [],
  loading: false,
  error: null,
  selectedEmployeeId: null,
};

const reviewTimesheetSlice = createSlice({
  name: 'reviewTimesheet',
  initialState,
  reducers: {
    setSelectedEmployeeId: (state, action: PayloadAction<string | null>) => {
      state.selectedEmployeeId = action.payload;
    },
    clearEmployeeTimesheets: (state, action: PayloadAction<string>) => {
      const employee = state.employees.find(emp => emp.id === action.payload);
      if (employee) {
        employee.timesheets = undefined;
        employee.timesheetsLoading = false;
        employee.timesheetsError = null;
      }
    },
    clearAllData: (state) => {
      state.employees = [];
      state.loading = false;
      state.error = null;
      state.selectedEmployeeId = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch supervised employees
    builder
      .addCase(fetchSupervisedEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupervisedEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.map((emp: ReviewEmployee) => ({
          id: emp._id,
          employeeId: emp.employee_id || emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          designation: emp.designation,
          pendingTimesheetCount: emp.pendingTimesheetCount || 0,
          timesheets: undefined,
          timesheetsLoading: false,
          timesheetsError: null,
        }));
      })
      .addCase(fetchSupervisedEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch employee timesheets
    builder
      .addCase(fetchEmployeeTimesheets.pending, (state, action) => {
        const employeeId = action.meta.arg.employeeId;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee) {
          employee.timesheetsLoading = true;
          employee.timesheetsError = null;
        }
      })
      .addCase(fetchEmployeeTimesheets.fulfilled, (state, action) => {
        const { employeeId, timesheets } = action.payload;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee) {
          employee.timesheetsLoading = false;
          employee.timesheets = timesheets.map((ts: EmployeeTimesheet) => {
            const project = ts.projectId?.projectName || ts.teamId?.teamName || 'No Project';
            return {
              id: ts._id,
              date: ts.date,
              project: project,
              projectId: ts.projectId?._id,
              isPublicProject: ts.projectId?.isPublic,
              task: ts.taskId?.taskName || 'No Task',
              taskId: ts.taskId?._id,
              teamId: ts.teamId?._id,
              isDepartmentTeam: ts.teamId?.isDepartment,
              description: ts.description || '',
              hours: ts.hours || 0,
              billableType: ts.billable || 'NonBillable',
              status: ts.status,
            };
          });
        }
      })
      .addCase(fetchEmployeeTimesheets.rejected, (state, action) => {
        const employeeId = action.meta.arg.employeeId;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee) {
          employee.timesheetsLoading = false;
          employee.timesheetsError = action.payload as string;
        }
      });

    // Approve timesheets
    builder
      .addCase(approveTimesheetsThunk.fulfilled, (state, action) => {
        const { employeeId, timesheetIds } = action.payload;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee && employee.timesheets) {
          // Update the status of approved timesheets
          employee.timesheets = employee.timesheets.map(ts =>
            timesheetIds.includes(ts.id)
              ? { ...ts, status: DailyTimesheetStatus.Approved }
              : ts
          );
          // Decrease pending count
          if (employee.pendingTimesheetCount !== undefined) {
            employee.pendingTimesheetCount = Math.max(0, employee.pendingTimesheetCount - timesheetIds.length);
          }
        }
      })
      .addCase(approveTimesheetsThunk.rejected, (state, action) => {
      });

    // Reject timesheets
    builder
      .addCase(rejectTimesheetsThunk.fulfilled, (state, action) => {
        const { employeeId, timesheetIds } = action.payload;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee && employee.timesheets) {
          // Update the status of rejected timesheets
          employee.timesheets = employee.timesheets.map(ts =>
            timesheetIds.includes(ts.id)
              ? { ...ts, status: DailyTimesheetStatus.Rejected }
              : ts
          );
          // Decrease pending count
          if (employee.pendingTimesheetCount !== undefined) {
            employee.pendingTimesheetCount = Math.max(0, employee.pendingTimesheetCount - timesheetIds.length);
          }
        }
      })
      .addCase(rejectTimesheetsThunk.rejected, (state, action) => {
      });
  },
});

export const {
  setSelectedEmployeeId,
  clearEmployeeTimesheets,
  clearAllData,
} = reviewTimesheetSlice.actions;

export default reviewTimesheetSlice.reducer;
