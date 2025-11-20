import { ReactNode } from 'react';

export interface IPopupLayoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  actions?: ReactNode;
}
