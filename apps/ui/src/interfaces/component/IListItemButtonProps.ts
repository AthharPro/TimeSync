import { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material';

export interface IListItemButtonProps {
  children: ReactNode;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}
