import { ReportFilter } from '../report/IReportFilter';
import { IEmployee } from '../user/IUser';
import { ReportMetadata } from '@tms/shared';
export interface UseReportGeneratorOptions {
  onSuccess?: (filename: string) => void;
  onError?: (error: string) => void;
}

export interface UseReportGeneratorReturn {
  isGenerating: boolean;
  supervisedEmployees: IEmployee[];
  reportMetadata: ReportMetadata | null;
  isLoadingEmployees: boolean;
  isLoadingMetadata: boolean;
  error: string | null;
  generateDetailedReport: (filter: ReportFilter, format: 'pdf' | 'excel') => Promise<void>;
  generateTimesheetEntries: (filter: ReportFilter, format: 'pdf' | 'excel') => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshMetadata: () => Promise<void>;
  clearError: () => void;
}