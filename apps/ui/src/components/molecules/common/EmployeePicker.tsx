import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchField from '../../atoms/common/SearchField';
import SelectedEmployeeChips from './SelectedEmployeeChips';
import EmployeeList from './EmployeeList';
import type { EmployeePickerProps } from '../../../interfaces/common/IProjectTeam';

const EmployeePicker: React.FC<EmployeePickerProps> = ({
  users,
  selected,
  onToggle,
  onRemove,
  searchTerm,
  onSearchChange,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
      <Box sx={{ flex: '0 0 50%',  }}>
        <Paper
          elevation={0}
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Find Users
            </Typography>
          </Box>

          <SearchField
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search by name, email, or designation..."
            label="Search Users"
          />

          {searchTerm && (
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              Showing {users.length} result{users.length !== 1 ? 's' : ''} for "
              {searchTerm}"
            </Typography>
          )}
        </Paper>

        {selected.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              mb: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <SelectedEmployeeChips
              employees={selected}
              onRemove={onRemove}
              title=""
              sx={{ mb: 0 }}
            />
          </Paper>
        )}
      </Box>
      <Box sx={{ flex: '0 0 50%' }}>
        <Paper
          elevation={0}
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Available Users
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
            >
              Click on users to add them
            </Typography>
          </Box>

          <EmployeeList
            employees={users}
            selectedEmployees={selected}
            onEmployeeToggle={onToggle}
            title=""
            searchTerm={searchTerm}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default EmployeePicker;
