import React from 'react';
import { Box } from '@mui/material';
import ReportLoadingSkeleton from '../../molecules/report/ReportLoadingSkeleton';
import ReportErrorAlert from '../../molecules/report/ReportErrorAlert';
import ReportEmptyState from '../../molecules/report/ReportEmptyState';
import ReportGroupedPreview from './ReportGroupedPreview';
import ReportSinglePreview from './ReportSinglePreview';
import { ReportPreviewContainerProps } from '../../../interfaces/report/IReportPreview';

const ReportPreviewContainer: React.FC<ReportPreviewContainerProps> = ({
  isLoading,
  error,
  supervisedEmployeesCount,
  reportType,
  previewColumns,
  previewRows,
  groupedPreviewData,
  onClearError
}) => {
 
  if (isLoading) {
    return <ReportLoadingSkeleton variant="full" />;
  }

 
  if (error) {
    return (
      <Box>
        <ReportErrorAlert error={error} onClose={onClearError} />
      </Box>
    );
  }


  if (supervisedEmployeesCount === 0) {
    return (
      <ReportEmptyState
        title="No Supervised Employees"
        description="You don't have any supervised employees to generate reports for. Contact your administrator if you believe this is incorrect."
      />
    );
  }


  if (!reportType) {
    return null;
  }

  const isGroupedReport = reportType === 'detailed-timesheet' || reportType === 'timesheet-entries' || reportType === 'submission-status' || reportType === 'approval-status';
  const hasGroupedData = Object.keys(groupedPreviewData).length > 0;

  if (isGroupedReport && hasGroupedData) {
    return <ReportGroupedPreview groupedPreviewData={groupedPreviewData} />;
  }

  return (
    <ReportSinglePreview
      columns={previewColumns}
      rows={previewRows}
    />
  );
};

export default ReportPreviewContainer;
