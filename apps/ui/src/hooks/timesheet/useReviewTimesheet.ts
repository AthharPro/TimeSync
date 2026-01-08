import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import {
  fetchSupervisedEmployees,
  fetchEmployeeTimesheets,
  approveTimesheetsThunk,
  rejectTimesheetsThunk,
  setSelectedEmployeeId,
  clearEmployeeTimesheets,
  clearAllData,
} from '../../store/slices/reviewTimesheetSlice';

export interface IUseReviewTimesheetReturn {
  // State
  employees: any[];
  loading: boolean;
  error: string | null;
  selectedEmployeeId: string | null;

  // Actions
  loadSupervisedEmployees: () => Promise<void>;
  loadEmployeeTimesheets: (employeeId: string, params?: { startDate?: Date; endDate?: Date }) => Promise<void>;
  approveSelectedTimesheets: (employeeId: string, timesheetIds: string[]) => Promise<any>;
  rejectSelectedTimesheets: (employeeId: string, timesheetIds: string[], rejectionReason: string) => Promise<any>;
  selectEmployee: (employeeId: string | null) => void;
  clearTimesheets: (employeeId: string) => void;
  clearAll: () => void;
  
  // Helper functions
  getEmployeeById: (employeeId: string) => any | undefined;
  getEmployeeTimesheets: (employeeId: string) => any[] | undefined;
  isEmployeeTimesheetsLoading: (employeeId: string) => boolean;
  getEmployeeTimesheetsError: (employeeId: string) => string | null;
}

export const useReviewTimesheet = (): IUseReviewTimesheetReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux store
  const employees = useSelector((state: RootState) => state.reviewTimesheet.employees);
  const loading = useSelector((state: RootState) => state.reviewTimesheet.loading);
  const error = useSelector((state: RootState) => state.reviewTimesheet.error);
  const selectedEmployeeId = useSelector((state: RootState) => state.reviewTimesheet.selectedEmployeeId);

  // Load supervised employees
  const loadSupervisedEmployees = useCallback(async () => {
    try {
      await dispatch(fetchSupervisedEmployees()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  // Load employee timesheets
  const loadEmployeeTimesheets = useCallback(
    async (employeeId: string, params?: { startDate?: Date; endDate?: Date }) => {
      try {
        await dispatch(fetchEmployeeTimesheets({ employeeId, ...params })).unwrap();
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Select employee
  const selectEmployee = useCallback(
    (employeeId: string | null) => {
      dispatch(setSelectedEmployeeId(employeeId));
    },
    [dispatch]
  );

  // Clear employee timesheets
  const clearTimesheets = useCallback(
    (employeeId: string) => {
      dispatch(clearEmployeeTimesheets(employeeId));
    },
    [dispatch]
  );

  // Clear all data
  const clearAll = useCallback(() => {
    dispatch(clearAllData());
  }, [dispatch]);

  // Helper: Get employee by ID
  const getEmployeeById = useCallback(
    (employeeId: string) => {
      return employees.find(emp => emp.id === employeeId);
    },
    [employees]
  );

  // Helper: Get employee timesheets
  const getEmployeeTimesheets = useCallback(
    (employeeId: string) => {
      const employee = employees.find(emp => emp.id === employeeId);
      return employee?.timesheets;
    },
    [employees]
  );

  // Helper: Check if employee timesheets are loading
  const isEmployeeTimesheetsLoading = useCallback(
    (employeeId: string) => {
      const employee = employees.find(emp => emp.id === employeeId);
      return employee?.timesheetsLoading || false;
    },
    [employees]
  );

  // Helper: Get employee timesheets error
  const getEmployeeTimesheetsError = useCallback(
    (employeeId: string) => {
      const employee = employees.find(emp => emp.id === employeeId);
      return employee?.timesheetsError || null;
    },
    [employees]
  );

  // Approve selected timesheets
  const approveSelectedTimesheets = useCallback(
    async (employeeId: string, timesheetIds: string[]) => {
      try {
        const result = await dispatch(approveTimesheetsThunk({ employeeId, timesheetIds })).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Reject selected timesheets
  const rejectSelectedTimesheets = useCallback(
    async (employeeId: string, timesheetIds: string[], rejectionReason: string) => {
      try {
        const result = await dispatch(rejectTimesheetsThunk({ employeeId, timesheetIds, rejectionReason })).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  return {
    // State
    employees,
    loading,
    error,
    selectedEmployeeId,

    // Actions
    loadSupervisedEmployees,
    loadEmployeeTimesheets,
    approveSelectedTimesheets,
    rejectSelectedTimesheets,
    selectEmployee,
    clearTimesheets,
    clearAll,

    // Helper functions
    getEmployeeById,
    getEmployeeTimesheets,
    isEmployeeTimesheetsLoading,
    getEmployeeTimesheetsError,
  };
};
