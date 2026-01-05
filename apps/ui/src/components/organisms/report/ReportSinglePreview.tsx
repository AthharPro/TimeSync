import React from 'react';
import { Box } from '@mui/material';
import ReportPreviewTable from '../../molecules/report/ReportPreviewTable';
import { ReportSinglePreviewProps } from '../../../interfaces/report/IReportPreview';

const ReportSinglePreview: React.FC<ReportSinglePreviewProps> = ({ 
  columns,
  rows
}) => {
  return (
    <Box>
      <ReportPreviewTable
        columns={columns}
        rows={rows}
      />
    </Box>
  );
};

export default ReportSinglePreview;
