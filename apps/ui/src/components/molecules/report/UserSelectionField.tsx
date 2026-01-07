import React from 'react';
import { Typography, useTheme } from '@mui/material';
import EmployeeSelect from './EmployeeSelect';
import ProjectTeamSelect from './ProjectTeamSelect';
import { UserSelectionFieldProps } from '../../../interfaces/report/IReportFilter';

const UserSelectionField: React.FC<UserSelectionFieldProps> = ({
  filterType,
  employees = [],
  selectedEmployeeIds = [],
  onEmployeeChange,
  teams = [],
  selectedTeamId = '',
  onTeamChange,
  isLoadingTeams = false,
  projects = [],
  selectedProjectId = '',
  onProjectChange,
  isLoadingProjects = false,
  disabled = false,
  showHelperText = true,
}) => {
  const theme = useTheme();

  const renderHelperText = (text: string, condition: boolean) => {
    if (!showHelperText || !condition) return null;
    return (
      <Typography
        variant="caption"
        sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
      >
        {text}
      </Typography>
    );
  };

  if (filterType === 'individual') {
    return (
      <>
        <EmployeeSelect
          employees={employees}
          selectedIds={selectedEmployeeIds && selectedEmployeeIds.length > 0 ? [selectedEmployeeIds[0]] : []}
          onChange={ids => onEmployeeChange ? onEmployeeChange(Array.isArray(ids) && ids.length > 0 ? [ids[0]] : []) : undefined}
          disabled={disabled}
          multiple={false}
        />
        {renderHelperText(
          'Select an employee',
          !selectedEmployeeIds || selectedEmployeeIds.length === 0
        )}
      </>
    );
  }

  if (filterType === 'team') {
    return (
      <>
        <ProjectTeamSelect
          items={teams}
          selectedId={selectedTeamId}
          onChange={onTeamChange || ((id) => undefined)}
          disabled={disabled || isLoadingTeams}
          label="Teams"
          placeholder="Search teams..."
        />
        {renderHelperText(
          'Selected team will include all its members',
          selectedTeamId !== ''
        )}
      </>
    );
  }

  if (filterType === 'project') {
    return (
      <>
        <ProjectTeamSelect
          items={projects}
          selectedId={selectedProjectId}
          onChange={onProjectChange || ((id) => undefined)}
          disabled={disabled || isLoadingProjects}
          label="Projects"
          placeholder="Search projects..."
        />
        {renderHelperText(
          'Selected project will include all its employees',
          selectedProjectId !== ''
        )}
      </>
    );
  }

 
  return (
    <>
      <EmployeeSelect
        employees={employees}
        selectedIds={selectedEmployeeIds}
        onChange={onEmployeeChange || ((ids) => undefined)}
        disabled={disabled}
      />
      {renderHelperText(
        'Optional: select one or more employees',
        selectedEmployeeIds.length === 0
      )}
    </>
  );
};

export default UserSelectionField;
