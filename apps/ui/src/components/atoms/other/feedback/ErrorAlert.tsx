import React from 'react';
import { Box, Alert } from '@mui/material';
import { IErrorAlertProps } from '../../../../interfaces/component';

const ErrorAlert: React.FC<IErrorAlertProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <Box sx={{ m: 2 }}>
      <Alert severity="error" onClose={onClose}>
        {error}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;


