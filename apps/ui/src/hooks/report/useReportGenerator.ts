import { useState, useEffect } from 'react';
import {
  generateDetailedTimesheetReport,
  generateTimesheetEntriesReport,
  getSupervisedEmployees,
  getReportMetadata
} from '../../api/report';
import { IEmployee } from '../../interfaces';
import { ReportFilter } from '../../interfaces/report/IReportFilter';
import { ReportMetadata } from '@tms/shared';
import { downloadBlobAsFile, generateReportFilename } from '../../utils';
import { UseReportGeneratorOptions, UseReportGeneratorReturn } from '../../interfaces/report/IReportGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '@tms/shared';
import { getAllActiveUsers } from '../../api/user';


export const useReportGenerator = (options: UseReportGeneratorOptions = {}): UseReportGeneratorReturn => {
  const { onSuccess, onError } = options;

  const { user: currentUser } = useAuth();
  const userRole = currentUser?.role as UserRole;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [supervisedEmployees, setSupervisedEmployees] = useState<IEmployee[]>([]);
  const [reportMetadata, setReportMetadata] = useState<ReportMetadata | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if user can see all data or only supervised data
  const canSeeAllData = userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin || userRole === UserRole.SuperAdmin;
  useEffect(() => {
    loadInitialData();
  }, [canSeeAllData]);

  const loadInitialData = async () => {
    await Promise.all([
      loadSupervisedEmployees(),
      loadReportMetadata()
    ]);
  };

  const loadSupervisedEmployees = async () => {
    setIsLoadingEmployees(true);
    setError(null);
    
    try {
      let response;
      
      if (canSeeAllData) {
        // Admin, SupervisorAdmin, SuperAdmin can see all users
        response = await getAllActiveUsers();
        setSupervisedEmployees(response.data.users || []);
      } else {
        // Supervisor can only see supervised employees
        response = await getSupervisedEmployees();
        setSupervisedEmployees(response.data.employees);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load employees';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const loadReportMetadata = async () => {
    setIsLoadingMetadata(true);
    setError(null);
    
    try {
      const response = await getReportMetadata();
      setReportMetadata(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load report metadata';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const generateReport = async (
    reportGenerator: (filter: ReportFilter, format: 'pdf' | 'excel') => Promise<Blob>,
    reportType: 'detailed-timesheet' | 'timesheet-entries',
    filter: ReportFilter,
    format: 'pdf' | 'excel'
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const blob = await reportGenerator(filter, format);
      
      // Check if blob is actually an error response (some APIs return JSON as blob on error)
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || `Failed to generate ${reportType} report`);
      }
      
      const filename = generateReportFilename(reportType as any, format);
      
      downloadBlobAsFile(blob, filename);
      
      onSuccess?.(filename);
    } catch (err: any) {
      let errorMessage = `Failed to generate ${reportType} report`;
      
      // Handle different error formats
      if (err.message && !err.response) {
        errorMessage = err.message;
      } else if (err.response?.data) {
        // If error data is a blob, try to parse it
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = err.response?.statusText || errorMessage;
          }
        } else if (typeof err.response.data === 'object') {
          errorMessage = err.response.data.message || errorMessage;
        }
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

 
 

  const generateDetailedReport = async (filter: ReportFilter, format: 'pdf' | 'excel') => {
    await generateReport(
      generateDetailedTimesheetReport,
      'detailed-timesheet',
      filter,
      format
    );
  };

  const generateTimesheetEntries = async (filter: ReportFilter, format: 'pdf' | 'excel') => {
    await generateReport(
      generateTimesheetEntriesReport,
      'timesheet-entries',
      filter,
      format
    );
  };

  const refreshEmployees = async () => {
    await loadSupervisedEmployees();
  };

  const refreshMetadata = async () => {
    await loadReportMetadata();
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isGenerating,
    supervisedEmployees,
    reportMetadata,
    isLoadingEmployees,
    isLoadingMetadata,
    error,
    generateDetailedReport,
    generateTimesheetEntries,
    refreshEmployees,
    refreshMetadata,
    clearError
  };
};