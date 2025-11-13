import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TableRowsIcon from '@mui/icons-material/TableRows';

export type ViewMode = 'calendar' | 'table';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      onChange(newView);
    }
  };

  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={handleChange}
      aria-label="view mode"
      size="small"
      sx={{
        '& .MuiToggleButton-root': {
          px: 2,
          py: 0.5,
          textTransform: 'none',
        },
      }}
    >
      <ToggleButton value="calendar" aria-label="calendar view">
        <CalendarMonthIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
        Calendar
      </ToggleButton>
      <ToggleButton value="table" aria-label="table view">
        <TableRowsIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
        Table
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewToggle;
