export interface IPopupLayoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  minHeight?: string | number;
  maxHeight?: string | number;
  showCloseButton?: boolean;
  disableBackdropClick?: boolean;
  contentPadding?: number | string;
  titleProps?: Record<string, any>;
  contentProps?: { sx?: object } & Record<string, any>;
  actions?: React.ReactNode;
}
