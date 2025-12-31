import { ReportFilter } from './IReportFilter';

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


export interface ReportSinglePreviewProps {
  columns: { key: string; header: string }[];
  rows: any[];
}

export interface ReportDataTableColumn<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  width?: string | number;
}

type InputColumn<T> =
  | ReportDataTableColumn<T>
  | {
      key: string;
      header: string;
      render?: (row: T) => React.ReactNode;
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

export interface DataTableColumn<T> {
  label: string;
  render: (row: T) => React.ReactNode;
  key: string;
  width?: string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
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
  action?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
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
