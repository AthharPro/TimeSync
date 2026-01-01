import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { AppSnackbarProps } from '../../../interfaces/other/ISnackBar';


const AppSnackbar: React.FC<AppSnackbarProps> = ({
  snackbar,
  onClose,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default AppSnackbar;
