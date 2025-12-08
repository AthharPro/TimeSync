import React from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { WeekNavigatorProps } from '@tms/ui/interfaces';

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  weekDays,
  onPreviousWeek,
  onNextWeek,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconButton onClick={onPreviousWeek} size="small">
        <ChevronLeftIcon />
      </IconButton>
      <Box sx={{ mx: 2 }}>
        {weekDays[0].monthName} {weekDays[0].dayNumber} - {weekDays[6].monthName} {weekDays[6].dayNumber},{' '}
        {weekDays[0].date.getFullYear()}
      </Box>
      <IconButton onClick={onNextWeek} size="small">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

export default WeekNavigator;
