import {  AlertColor } from '@mui/material';
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface AppSnackbarProps {
  snackbar: SnackbarState;
  onClose: () => void;
  autoHideDuration?: number;
}