import React from 'react';
import { Divider } from '@mui/material';
import { IReportDividerProps } from '../../../interfaces/report/IReport';

const ReportDivider: React.FC<IReportDividerProps> = ({ 
  spacing = 'medium',
  sx,
  ...props 
}) => {
  const spacingMap = {
    small: 1,
    medium: 2,
    large: 3
  };

  return (
    <Divider
      sx={{
        my: spacingMap[spacing],
        ...sx
      }}
      {...props}
    />
  );
};

export default ReportDivider;
