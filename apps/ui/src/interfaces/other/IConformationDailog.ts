import { ReactNode } from 'react';

export interface IConfirmDialogProps {
  open: boolean;
  close?: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  iconColor?: string;
  confirmButtonColor?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
}