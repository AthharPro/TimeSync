import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ISupervisorSelectorProps } from '../../../interfaces/common/IProjectTeam';

const SupervisorSelector: React.FC<ISupervisorSelectorProps> = ({
  selectedEmployees,
  supervisor,
  onSupervisorChange,
  caption = 'Choose a supervisor from selected employees',
}) => {
  const theme = useTheme();
  
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="supervisor-select">Supervisor</InputLabel>
      <Select
        labelId="supervisor-select"
        value={supervisor}
        label="Supervisor"
        onChange={(e) => onSupervisorChange((e.target.value as string) || '')}
        disabled={selectedEmployees.length === 0}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 200,
              backgroundColor: theme.palette.background.default,
            },
          },
        }}
      >
        {selectedEmployees.map((e) => (
          <MenuItem key={e.id} value={e.id} sx={{ bgcolor: theme.palette.background.default }}>
            {e.designation ? `${e.name} - ${e.designation}` : e.name}
          </MenuItem>
        ))}
      </Select>
      <Typography variant="caption">{caption}</Typography>
    </FormControl>
  );
};

export default SupervisorSelector;