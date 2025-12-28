import type { ReactNode } from 'react';
import { ReportFilter } from './IReportFilter';

export interface ReportSinglePreviewProps {
  columns: { key: string; header: string }[];
  rows: any[];
}

export interface ReportDataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  width?: string | number;
}

type InputColumn<T> =
  | ReportDataTableColumn<T>
  | {
      key: string;
      header: string;
      render?: (row: T) => ReactNode;
      label?: never;
    };

export interface ReportPreviewTableProps<T = any> {
  columns: InputColumn<T>[];
  rows: T[];
  title?: string;
  subtitle?: string;
  subtitle2?: string;
  getRowKey?: (row: T) => string | number;
}

export interface ReportGroupedPreviewProps {
  groupedPreviewData: {
    [employeeKey: string]: {
      employeeName: string;
      employeeEmail: string;
      tables: Array<{
        title: string;
        columns: { key: string; header: string }[];
        rows: any[];
      }>;
    };
  };
}

export interface ReportEmployeeSectionProps {
  employeeKey: string;
  employeeData: {
    employeeName: string;
    employeeEmail: string;
    tables: Array<{
      title: string;
      columns: { key: string; header: string }[];
      rows: any[];
    }>;
  };
}

export  interface ReportEmployeeHeaderProps {
  employeeName: string;
  employeeEmail: string;
}


export interface ReportTableLayoutProps {
  title?: string;
  action?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  noBorder?: boolean;
}

export interface ReportLoadingSkeletonProps {
  variant?: 'form' | 'table' | 'full';
  height?: number;
}

export interface ReportPreviewContainerProps {
  isLoading: boolean;
  error: string | null;
  supervisedEmployeesCount: number;
  reportType: 'detailed-timesheet' | 'timesheet-entries' | '';
  previewColumns: { key: string; header: string }[];
  previewRows: any[];
  groupedPreviewData: {
    [employeeKey: string]: {
      employeeName: string;
      employeeEmail: string;
      tables: Array<{
        title: string;
        columns: { key: string; header: string }[];
        rows: any[];
      }>;
    };
  };
  onClearError: () => void;
}

export interface ReportEmptyStateProps {
  title: string;
  description: string;
  iconVariant?: 'default' | 'large';
}

export interface DetailedTimesheetPreviewRow {
  employeeName: string;
  employeeEmail: string;
  weekStartDate: string;
  weekEndDate?: string;
  status: string;
  category: string;
  work: string;
  projectName?: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  total: string;
}

export interface UseReportTypeOptions {
  initialType?: 'detailed-timesheet' | 'timesheet-entries' | '';
}

export interface UseReportTypeReturn {
  reportType: 'detailed-timesheet' | 'timesheet-entries' | '';
  setReportType: (type: 'detailed-timesheet' | 'timesheet-entries' | '') => void;
}

export interface UseReportPreviewOptions {
  reportType: 'detailed-timesheet' | 'timesheet-entries' | '';
  filter: ReportFilter;
  isFilterValid?: boolean;
}

export interface UseReportPreviewReturn {
  previewRows: any[];
  previewColumns: { key: string; header: string }[];
  groupedPreviewData: {
    [employeeKey: string]: {
      employeeName: string;
      employeeEmail: string;
      tables: Array<{
        title: string;
        columns: { key: string; header: string }[];
        rows: any[];
      }>;
    };
  };
  isLoadingPreview: boolean;
  previewError: string | null;
  loadPreview: () => Promise<void>;
}
