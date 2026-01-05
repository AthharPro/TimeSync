import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import EmployeeList from './EmployeeList';
import SearchField from '../../atoms/common/SearchField';
import type { IStaffSelectorProps } from '../../../interfaces/common/IProjectTeam';

const StaffSelector: React.FC<IStaffSelectorProps> = ({
  selectedEmployees,
  availableEmployees,
  searchTerm,
  onSearchChange,
  onEmployeeToggle,
  title = "Add more employees",
  searchPlaceholder = "Search by name, email, or designation...",
  searchLabel = "Search Employees",
}) => {
  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <SearchField
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        label={searchLabel}
        sx={{ mb: 2 }}
      />

      <EmployeeList
        employees={availableEmployees.filter(
          (e) =>
            !selectedEmployees.some(
              (se) => (se._id || se.id) === (e._id || e.id)
            )
        )}
        selectedEmployees={selectedEmployees}
        onEmployeeToggle={onEmployeeToggle}
        searchTerm={searchTerm}
        title="Available Employees"
      />
    </>
  );
};

export default StaffSelector;