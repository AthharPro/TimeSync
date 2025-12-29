import React from 'react';
import { Box, Alert, AlertProps } from '@mui/material';

interface ReportErrorAlertProps extends AlertProps {
  error: string | null;
  onClose?: () => void;
}

const ReportErrorAlert: React.FC<ReportErrorAlertProps> = ({ 
  error, 
  onClose,
  sx,
  ...props 
}) => {
  if (!error) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert 
        severity="error" 
        onClose={onClose}
        sx={sx}
        {...props}
      >
        {error}
      </Alert>
    </Box>
  );
};

export default ReportErrorAlert;
