import React from 'react';
import { Paper, PaperProps } from '@mui/material';

interface ReportCardProps extends Omit<PaperProps, 'variant'> {
  variant?: 'elevation' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const ReportCard: React.FC<ReportCardProps> = ({ 
  variant = 'elevation',
  padding = 'medium',
  children,
  sx,
  ...props 
}) => {
  const paddingMap = {
    none: 0,
    small: 1,
    medium: 2,
    large: 3
  };

  return (
    <Paper
      variant={variant}
      sx={{
        p: paddingMap[padding],
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default ReportCard;
