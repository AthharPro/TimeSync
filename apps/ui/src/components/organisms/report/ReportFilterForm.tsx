import { Box } from '@mui/material';
import FilterRow from '../../atoms/report/FilterRow';
import FilterColumn from '../../atoms/report/FilterColumn';
import DateRangePicker from '../../molecules/report/DateRangePicker';
import UserFilterTypeSelector from '../../molecules/report/UserFilterTypeSelector';
import { Dayjs } from 'dayjs';
import UserSelectionField from '../../molecules/report/UserSelectionField';
import { useEffect, useRef } from 'react';
import { ReportFilter, ReportEmployee } from '../../../interfaces/report/IReportFilter';
import { useUserFilterType } from '../../../hooks/report/useUserFilterType';

interface IReportFilterFormProps {
  resetTrigger?: number;
  currentFilter: ReportFilter;
  updateFilter: (filter: ReportFilter) => void;
  userRole: string;
  canSeeAllData: boolean;
  supervisedEmployees: ReportEmployee[];
  disabled?: boolean;
}

export const ReportFilterForm = ({ 
  resetTrigger, 
  currentFilter, 
  updateFilter, 
  userRole, 
  canSeeAllData, 
  supervisedEmployees,
  disabled = false 
}: IReportFilterFormProps) => {
  const prevResetTriggerRef = useRef(resetTrigger);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > (prevResetTriggerRef.current ?? 0)) {
      // Reset date filters
      updateFilter({
        startDate: undefined,
        endDate: undefined,
      });
      prevResetTriggerRef.current = resetTrigger;
    }
  }, [resetTrigger, updateFilter]);

  // User filter type management 
  const {
    userFilterType,
    setUserFilterType,
    availableFilterOptions,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    isLoadingTeams,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isLoadingProjects,
    users,
    isLoadingUsers,
    resetFilterType,
  } = useUserFilterType({ userRole, canSeeAllData });
  // Date range handlers
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

  const handleDateRangeSelect = (start: Dayjs, end: Dayjs) => {
    updateFilter({
      ...currentFilter,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
    });
  };

   // Employee selection handler
  const handleEmployeeChange = (ids: string[]) => {
    updateFilter({
      ...currentFilter,
      employeeIds: ids,
    });
  };

  // Team selection handler
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    updateFilter({
      ...currentFilter,
      teamId: teamId,
      employeeIds: [],
    });
  };

  // Project selection handler
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    updateFilter({
      ...currentFilter,
      projectId: projectId,
      employeeIds: [],
    });
  };

  // Transform data for UserSelectionField
  const teamItems = teams.map(team => ({
    _id: team._id,
    name: team.teamName,
    userCount: team.members.length,
    supervisor: team.supervisor 
      ? `${team.supervisor.firstName} ${team.supervisor.lastName}`
      : undefined,
  }));

  const projectItems = projects.map(project => ({
    _id: project._id,
    name: project.projectName,
    userCount: project.employees.length,
    supervisor: project.supervisor 
      ? `${project.supervisor.firstName} ${project.supervisor.lastName}`
      : undefined,
  }));

  

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
            filterType={userFilterType || undefined}
            onChange={setUserFilterType}
            availableOptions={availableFilterOptions}
          />
        </FilterColumn>
        <FilterColumn>
          <UserSelectionField
            filterType={userFilterType}
            employees={userFilterType === 'individual' ? users : supervisedEmployees}
            selectedEmployeeIds={currentFilter.employeeIds || []}
            onEmployeeChange={handleEmployeeChange}
            teams={teamItems}
            selectedTeamId={selectedTeamId}
            onTeamChange={handleTeamChange}
            isLoadingTeams={isLoadingTeams}
            projects={projectItems}
            selectedProjectId={selectedProjectId}
            onProjectChange={handleProjectChange}
            isLoadingProjects={isLoadingProjects}
            disabled={disabled || (userFilterType === 'individual' && isLoadingUsers)}
            showHelperText={true}
          />
        </FilterColumn>
      </FilterRow>
    </Box>
  );
};