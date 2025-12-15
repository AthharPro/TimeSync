import React from 'react';
import { Box } from '@mui/material';
import ReportDivider  from '../../atoms/report/ReportDivider';
import {IReportLayoutProps} from '../../../interfaces/report/IReport'

const ReportLayout: React.FC<IReportLayoutProps> = ({
  filterSection,
  previewSection
}) => {
  return (
    <Box>
      {filterSection}
      <ReportDivider spacing="medium" />
      {previewSection}
    </Box>
  );
};

export default ReportLayout;
