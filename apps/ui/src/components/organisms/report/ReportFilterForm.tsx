import { Box } from '@mui/material';
import FilterRow from '../../atoms/report/FilterRow';
import FilterColumn from '../../atoms/report/FilterColumn';
import DateRangePicker from '../../molecules/report/DateRangePicker';
import UserFilterTypeSelector from '../../molecules/report/UserFilterTypeSelector';
import dayjs, { Dayjs } from 'dayjs';
import UserSelectionField from '../../molecules/report/UserSelectionField';
import {
  mockEmployees,
  mockTeams,
  mockProjects,
} from '../../../data/reportFiltersMockData';
import { useState, useEffect, useRef } from 'react';
import { ReportFilter } from '../../../interfaces/report/IReportFilter';

interface IReportFilterFormProps {
  resetTrigger?: number;
  currentFilter: ReportFilter;
  updateFilter: (filter: ReportFilter) => void;
}

export const ReportFilterForm = ({ resetTrigger, currentFilter, updateFilter }: IReportFilterFormProps) => {
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [filterType, setFilterType] = useState<'individual' | 'team' | 'project' | ''>('');
  
  const prevResetTriggerRef = useRef(resetTrigger);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > (prevResetTriggerRef.current ?? 0)) {
      setSelectedEmployeeIds([]);
      setSelectedTeamId('');
      setSelectedProjectId('');
      setFilterType('');
      // Reset date filters
      updateFilter({
        startDate: undefined,
        endDate: undefined,
      });
      prevResetTriggerRef.current = resetTrigger;
    }
  }, [resetTrigger, updateFilter]);

  const handleStartDateChange = (date: Dayjs | null) => {
    updateFilter({
      ...currentFilter,
      startDate: date ? date.format('YYYY-MM-DD') : undefined,
    });
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    updateFilter({
      ...currentFilter,
      endDate: date ? date.format('YYYY-MM-DD') : undefined,
    });
  };

  const handleFilterTypeChange = (newFilterType: 'individual' | 'team' | 'project') => {
    setFilterType(newFilterType);
    // Reset selections when filter type changes
    setSelectedEmployeeIds([]);
    setSelectedTeamId('');
    setSelectedProjectId('');
  };

  

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FilterRow>
        <FilterColumn>
          <DateRangePicker
            startDate={currentFilter.startDate}
            endDate={currentFilter.endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
        </FilterColumn>
        <FilterColumn>
          <UserFilterTypeSelector 
            filterType={filterType || undefined}
            onChange={handleFilterTypeChange}
          />
        </FilterColumn>
        <FilterColumn>
          <UserSelectionField
            filterType={filterType as 'individual' | 'team' | 'project'}
            employees={mockEmployees}
            selectedEmployeeIds={selectedEmployeeIds}
            onEmployeeChange={(ids) => setSelectedEmployeeIds(ids)}
            teams={mockTeams}
            selectedTeamId={selectedTeamId}
            onTeamChange={(id) => setSelectedTeamId(id)}
            projects={mockProjects}
            selectedProjectId={selectedProjectId}
            onProjectChange={(id) => setSelectedProjectId(id)}
          />
        </FilterColumn>
      </FilterRow>
    </Box>
  );
};
