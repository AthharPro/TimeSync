import React from 'react';
import { Box, Typography } from '@mui/material';
import ReportCard  from '../../atoms/report/ReportCard';
import ReportIcon from '../../atoms/report/ReportIcon';
import ReportTitle from '../../atoms/report/ReportTitle';
import { ReportEmptyStateProps } from '../../../interfaces/report/IReportPreview';
const ReportEmptyState: React.FC<ReportEmptyStateProps> = ({ 
  title,
  description,
  iconVariant = 'large'
}) => {
  return (
    <ReportCard padding="large" sx={{ textAlign: 'center' }}>
      <ReportIcon variant={iconVariant} sx={{ mb: 2 }} />
      <ReportTitle variant="h6" sx={{ mb: 2 }}>
        {title}
      </ReportTitle>
      <Typography variant="body2" color="textSecondary">
        {description}
      </Typography>
    </ReportCard>
  );
};

export default ReportEmptyState;
