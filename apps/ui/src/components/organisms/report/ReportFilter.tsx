import ReportFilterLayout from '../../templates/report/ReportFilterLayout';
import QuickDateButtons from '../../molecules/report/QuickDateButtons';
import  { Dayjs } from 'dayjs';
import { useEffect, useRef } from 'react';
import { IReportFilterProps } from '../../../interfaces/report/IReportFilter';
import { useAuth } from '../../../contexts/AuthContext';
import { useReportGenerator } from '../../../hooks/report/useReportGenerator';
import { UserRole } from '@tms/shared';
import { ReportFilterForm } from './ReportFilterForm';

export const ReportFilter = ({ resetTrigger, currentFilter, onFilterChange }: IReportFilterProps) => {
  const { user } = useAuth();
  const { supervisedEmployees } = useReportGenerator();
  
  const prevResetTriggerRef = useRef(resetTrigger);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > (prevResetTriggerRef.current ?? 0)) {
      // Reset will be handled by parent
      prevResetTriggerRef.current = resetTrigger;
    }
  }, [resetTrigger]);

  const handleDateRangeSelect = (start: Dayjs, end: Dayjs) => {
    if (onFilterChange && currentFilter) {
      onFilterChange({
        ...currentFilter,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
      });
    }
  };

  // Determine if user can see all data based on role
  const canSeeAllData = user?.role === UserRole.Admin || user?.role === UserRole.SupervisorAdmin;

  return (
    <ReportFilterLayout
      title="Filters"
      noBorder
      action={<QuickDateButtons onDateRangeSelect={handleDateRangeSelect} />}
      children={
        <ReportFilterForm 
          resetTrigger={resetTrigger}
          currentFilter={currentFilter || {}}
          updateFilter={onFilterChange || (() => { /* no-op */ })}
          userRole={user?.role || ''}
          canSeeAllData={canSeeAllData}
          supervisedEmployees={supervisedEmployees}
        />
      }
    ></ReportFilterLayout>
  );
};
