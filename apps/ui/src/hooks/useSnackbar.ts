import { useState, useCallback } from 'react';
import { AlertColor } from '@mui/material';
import { SnackbarState } from '../interfaces/other/ISnackBar';
export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = useCallback((message: string, severity: AlertColor = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error');
  }, [showSnackbar]);

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    snackbar,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar,
  };
};
