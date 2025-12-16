import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import {
  fetchReportMetadata,
  fetchSupervisedEmployees,
  generateDetailedReport,
  generateEntriesReport,
  clearError,
  clearReportData,
} from '../../store/slices/reportSlice';
import { GenerateReportParams } from '../../api/report';
import { ReportFilter } from '../../interfaces/report/IReportFilter';

export interface UseReportReturn {
  // State
  metadata: any | null;
  supervisedEmployees: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  loading: boolean;
  error: string | null;
  generatingReport: boolean;
  reportError: string | null;

  // Actions
  loadMetadata: () => Promise<void>;
  loadSupervisedEmployees: () => Promise<void>;
  generateDetailedTimesheetReport: (params: GenerateReportParams) => Promise<Blob | any>;
  generateTimesheetEntriesReport: (params: GenerateReportParams) => Promise<Blob | any>;
  clearErrors: () => void;
  clearReport: () => void;
}

export const useReport = (): UseReportReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux store
  const metadata = useSelector((state: RootState) => state.report.metadata);
  const supervisedEmployees = useSelector(
    (state: RootState) => state.report.supervisedEmployees
  );
  const loading = useSelector((state: RootState) => state.report.loading);
  const error = useSelector((state: RootState) => state.report.error);
  const generatingReport = useSelector((state: RootState) => state.report.generatingReport);
  const reportError = useSelector((state: RootState) => state.report.reportError);

  // Load report metadata
  const loadMetadata = useCallback(async () => {
    try {
      await dispatch(fetchReportMetadata()).unwrap();
    } catch (error) {
      console.error('Failed to load report metadata:', error);
    }
  }, [dispatch]);

  // Load supervised employees
  const loadSupervisedEmployees = useCallback(async () => {
    try {
      await dispatch(fetchSupervisedEmployees()).unwrap();
    } catch (error) {
      console.error('Failed to load supervised employees:', error);
    }
  }, [dispatch]);

  // Generate detailed timesheet report
  const generateDetailedTimesheetReport = useCallback(
    async (params: GenerateReportParams): Promise<Blob | any> => {
      try {
        const result = await dispatch(generateDetailedReport(params)).unwrap();
        return result.data;
      } catch (error) {
        console.error('Failed to generate detailed timesheet report:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Generate timesheet entries report
  const generateTimesheetEntriesReport = useCallback(
    async (params: GenerateReportParams): Promise<Blob | any> => {
      try {
        const result = await dispatch(generateEntriesReport(params)).unwrap();
        return result.data;
      } catch (error) {
        console.error('Failed to generate timesheet entries report:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Clear errors
  const clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear report data
  const clearReport = useCallback(() => {
    dispatch(clearReportData());
  }, [dispatch]);

  return {
    // State
    metadata,
    supervisedEmployees,
    loading,
    error,
    generatingReport,
    reportError,

    // Actions
    loadMetadata,
    loadSupervisedEmployees,
    generateDetailedTimesheetReport,
    generateTimesheetEntriesReport,
    clearErrors,
    clearReport,
  };
};

