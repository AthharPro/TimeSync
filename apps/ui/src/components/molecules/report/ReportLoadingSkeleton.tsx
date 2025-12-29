import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';
import ReportCard  from '../../atoms/report/ReportCard';
import { ReportLoadingSkeletonProps } from '../../../interfaces/report/IReportPreview';
const ReportLoadingSkeleton: React.FC<ReportLoadingSkeletonProps> = ({ 
  variant = 'full',
  height = 200
}) => {
  const renderFormSkeleton = () => (
    <ReportCard padding="large">
      <Skeleton variant="text" width="30%" height={32} />
      <Skeleton variant="rectangular" height={height} sx={{ mt: 2 }} />
    </ReportCard>
  );

  const renderTableSkeleton = () => (
    <ReportCard padding="large">
      <Skeleton variant="text" width="30%" height={32} />
      <Skeleton variant="rectangular" height={height} sx={{ mt: 2 }} />
    </ReportCard>
  );

  const renderFullSkeleton = () => (
    <Box>
      <ReportCard padding="large" sx={{ mb: 3 }}>
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="rectangular" height={height} sx={{ mt: 2 }} />
      </ReportCard>
      <ReportCard padding="large">
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="rectangular" height={height} sx={{ mt: 2 }} />
      </ReportCard>
    </Box>
  );

  switch (variant) {
    case 'form':
      return renderFormSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'full':
    default:
      return renderFullSkeleton();
  }
};

export default ReportLoadingSkeleton;
