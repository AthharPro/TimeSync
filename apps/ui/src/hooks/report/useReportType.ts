import { useState } from 'react';

export interface UseReportTypeOptions {
  initialType?: 'detailed-timesheet' | 'timesheet-entries' | '';
}

export interface UseReportTypeReturn {
  reportType: 'detailed-timesheet' | 'timesheet-entries' | '';
  setReportType: (type: 'detailed-timesheet' | 'timesheet-entries' | '') => void;
}

export const useReportType = ({ 
  initialType = '' 
}: UseReportTypeOptions = {}): UseReportTypeReturn => {
  const [reportType, setReportType] = useState<'detailed-timesheet' | 'timesheet-entries' | ''>(initialType);

  return {
    reportType,
    setReportType
  };
};
