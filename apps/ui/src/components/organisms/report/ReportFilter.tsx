import ReportFilterLayout from '../../templates/report/ReportFilterLayout';
import QuickDateButtons from '../../molecules/report/QuickDateButtons';
import  { Dayjs } from 'dayjs';
import { useReportFilters } from '../../../hooks/report/useReportFilters';
import { ReportFilterForm } from './ReportFilterForm';
import { useEffect, useRef } from 'react';
import { IReportFilterProps } from '../../../interfaces/report/IReportFilter';

export const ReportFilter = ({ resetTrigger }: IReportFilterProps) => {
  const {
    currentFilter,
    handleFilterChange: updateFilter,
    resetFilters,
  } = useReportFilters();
  
  const prevResetTriggerRef = useRef(resetTrigger);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > (prevResetTriggerRef.current ?? 0)) {
      resetFilters();
      prevResetTriggerRef.current = resetTrigger;
    }
  }, [resetTrigger, resetFilters]);

  const handleDateRangeSelect = (start: Dayjs, end: Dayjs) => {
    updateFilter({
      ...currentFilter,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
    });
  };

  return (
    <ReportFilterLayout
      title="Filters"
      noBorder
      action={<QuickDateButtons onDateRangeSelect={handleDateRangeSelect} />}
      children={
        <ReportFilterForm 
          resetTrigger={resetTrigger}
          currentFilter={currentFilter}
          updateFilter={updateFilter}
        />
      }
    ></ReportFilterLayout>
  );
};
