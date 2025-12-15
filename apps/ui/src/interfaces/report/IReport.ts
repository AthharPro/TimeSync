import { DividerProps } from '@mui/material';

export interface IReportLayoutProps {
  filterSection: React.ReactNode;
  previewSection: React.ReactNode;
}

export interface IReportDividerProps extends DividerProps {
  spacing?: 'small' | 'medium' | 'large';
}

export interface IReportWindowProps {
  onReset: () => void;
}

export interface IReportPreviewLayout {
    reportType: React.ReactNode;
    generateBtn: React.ReactNode;
    preview: React.ReactNode;
}