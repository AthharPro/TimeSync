import { ReactNode } from 'react';
import { ButtonProps } from '@mui/material';

export interface IBaseBtnProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  fullWidth?: boolean;
}
