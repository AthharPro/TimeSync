import React from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface ReportTitleProps extends TypographyProps {
  variant?: 'h4' | 'h5' | 'h6';
  color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary';
}

const ReportTitle: React.FC<ReportTitleProps> = ({ 
  variant = 'h6',
  color = 'primary',
  children,
  sx,
  ...props 
}) => {
  return (
    <Typography
      variant={variant}
      sx={{
        color: `${color}.main`,
        fontWeight: 600,
        ...sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default ReportTitle;
