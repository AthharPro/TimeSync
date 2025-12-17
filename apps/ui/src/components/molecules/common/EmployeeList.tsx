import React from 'react';
import { Box, List, Typography, Chip } from '@mui/material';
import EmployeeListItem from './EmployeeListItem';
import type { IEmployeeListProps } from '../../../interfaces/common/IProjectTeam';
import type { IEmployee } from '../../../interfaces/user/IUser';
import { useTheme } from '@mui/material/styles';

const EmployeeList: React.FC<IEmployeeListProps> = ({
  employees,
  selectedEmployees,
  onEmployeeToggle,
  emptyMessage = 'No employees available',
  searchTerm,
  maxHeight = 400,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ maxHeight, overflow: 'auto' }}>
      {employees.length > 0 ? (
        <List sx={{ p: 0 }}>
          {employees.map((employee: IEmployee) => {
            const employeeId = employee._id || employee.id;
            const isSelected = selectedEmployees.some(
              (emp: IEmployee) => (emp._id || emp.id) === employeeId
            );
            return (
              <Box key={employeeId || employee.email}>
                <EmployeeListItem
                  employee={employee}
                  isSelected={!!isSelected}
                  onToggle={onEmployeeToggle}
                />
              </Box>
            );
          })}
        </List>
      ) : (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
                mb: 1,
              }}
            >
              {searchTerm ? 'No Results Found' : 'No Employees Available'}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 300,
                lineHeight: 1.5,
              }}
            >
              {searchTerm
                ? `No employees found matching "${searchTerm}". Try adjusting your search terms.`
                : emptyMessage}
            </Typography>
          </Box>

          {searchTerm && (
            <Chip
              label={`Search: "${searchTerm}"`}
              size="small"
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                fontWeight: 500,
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeList;
