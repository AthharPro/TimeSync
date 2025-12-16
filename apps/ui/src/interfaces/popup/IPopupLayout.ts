import { ReactNode } from 'react';

export interface IPopupLayoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  actions?: ReactNode;
  paperHeight?: string | number;
}

export interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
  user?: any | null;
}

