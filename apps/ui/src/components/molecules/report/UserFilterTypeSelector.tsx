import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  useTheme 
} from '@mui/material';
import { UserFilterType } from '../../../interfaces/report/IReportFilter';
import { UserFilterTypeSelectorProps } from '../../../interfaces/report/IReportFilter';

const UserFilterTypeSelector: React.FC<UserFilterTypeSelectorProps> = ({ 
  filterType, 
  onChange, 
  disabled = false,
  availableOptions = ['individual', 'team', 'project']
}) => {
  const theme = useTheme();

  const handleChange = (event: any) => {
    if (onChange) {
      onChange(event.target.value as UserFilterType);
    }
  };

  return (
    <Box sx={{ flex: 1 }}>
      <FormControl fullWidth size="small" disabled={disabled} variant="outlined">
        <InputLabel id="filter-by-label">Filter By</InputLabel>
        <Select
          labelId="filter-by-label"
          id="filter-by"
          value={filterType || ''}
          onChange={handleChange}
          label="Filter By"
          MenuProps={{
            PaperProps: {
              style: {
                backgroundColor: theme.palette.background.default,
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            <em>Select filter type</em>
          </MenuItem>
          {availableOptions.includes('individual') && (
            <MenuItem value="individual">Individual Users</MenuItem>
          )}
          {availableOptions.includes('team') && (
            <MenuItem value="team">Team-wise Users</MenuItem>
          )}
          {availableOptions.includes('project') && (
            <MenuItem value="project">Project-wise Users</MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default UserFilterTypeSelector;

