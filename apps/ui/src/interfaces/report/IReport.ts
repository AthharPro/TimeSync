import { DividerProps } from '@mui/material';
import type { ReactNode } from 'react';

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

