import { useState } from 'react';
import {UseReportTypeOptions, UseReportTypeReturn} from '../../interfaces/report/IReportPreview';

export const useReportType = ({ 
  initialType = '' 
}: UseReportTypeOptions = {}): UseReportTypeReturn => {
  const [reportType, setReportType] = useState<'detailed-timesheet' | 'timesheet-entries' | ''>(initialType);

  return {
    reportType,
    setReportType
  };
};
