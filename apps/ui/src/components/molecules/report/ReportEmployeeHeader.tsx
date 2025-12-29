import React from 'react';
import { Box, Typography } from '@mui/material';
import  ReportTitle  from '../../atoms/report/ReportTitle';
import {ReportEmployeeHeaderProps} from '../../../interfaces/report/IReportPreview';
import {useTheme} from '@mui/material/styles';
const ReportEmployeeHeader: React.FC<ReportEmployeeHeaderProps> = ({ 
  employeeName,
  employeeEmail
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2 }}>
      <ReportTitle variant="h6" sx={{color:theme.palette.text.primary}}>
        {employeeName} - {employeeEmail}
      </ReportTitle>
    </Box>
  );
};

export default ReportEmployeeHeader;
