import { useState } from 'react';
import { ReportFilter } from '../../interfaces/report/IReportFilter';
import { 
  UseReportFiltersOptions as UseReportFiltersOptions, 
  UseReportFiltersReturn as UseReportFiltersReturn 
} from '../../interfaces/hook/IReport';

export const useReportFilters = ({ 
  initialFilter = {} 
}: UseReportFiltersOptions = {}): UseReportFiltersReturn => {
  const [currentFilter, setCurrentFilter] = useState<ReportFilter>(initialFilter);
  const [isFilterValid, setIsFilterValid] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  const handleFilterChange = (filter: ReportFilter) => {
    setCurrentFilter(filter);
    const hasDateRange = !!(filter.startDate && filter.endDate);
    const hasEmployees = !!(filter.employeeIds && filter.employeeIds.length > 0);
    const hasTeam = !!(filter.teamId && filter.teamId !== '');
    const hasProject = !!(filter.projectId && filter.projectId !== '');
    setIsFilterValid(hasDateRange && (hasEmployees || hasTeam || hasProject));
  };

  const resetFilters = () => {
    setCurrentFilter({});
    setIsFilterValid(false);
    setResetCounter((c) => c + 1);
  };

  return {
    currentFilter,
    isFilterValid,
    resetCounter,
    setCurrentFilter,
    handleFilterChange,
    resetFilters
  };
};