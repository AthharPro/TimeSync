import React from 'react';
import ReportTableLayout from '../../templates/report/ReportTableLayout';
import  ReportEmployeeSection from '../../molecules/report/ReportEmployeeSection';
import { ReportGroupedPreviewProps } from '../../../interfaces/report/IReportPreview';

const ReportGroupedPreview: React.FC<ReportGroupedPreviewProps> = ({ 
  groupedPreviewData 
}) => {
  return (
    <ReportTableLayout title="Preview Table" noBorder>
      {Object.entries(groupedPreviewData).map(([employeeKey, employeeData]) => (
        <ReportEmployeeSection
          key={employeeKey}
          employeeKey={employeeKey}
          employeeData={employeeData}
        />
      ))}
    </ReportTableLayout>
  );
};

export default ReportGroupedPreview;
