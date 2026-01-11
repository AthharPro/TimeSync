import { DividerProps } from '@mui/material';
import type { ReactNode } from 'react';
import { ReportFilter, ReportEmployee } from '../../interfaces/report/IReportFilter';
export interface IReportLayoutProps {
  filterSection: ReactNode;
  previewSection: ReactNode;
}

export interface IReportDividerProps extends DividerProps {
  spacing?: 'small' | 'medium' | 'large';
}

export interface IReportWindowProps {
  onReset?: () => void;
}

export interface IReportPreviewLayout {
  reportType: ReactNode;
  generateBtn: ReactNode;
  preview: ReactNode;
}

export interface IReportFilterFormProps {
  resetTrigger?: number;
  currentFilter: ReportFilter;
  updateFilter: (filter: ReportFilter) => void;
  userRole: string;
  canSeeAllData: boolean;
  supervisedEmployees: ReportEmployee[];
  disabled?: boolean;
}
