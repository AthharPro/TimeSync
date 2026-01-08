import React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { IDateRangeCellProps } from '../../../interfaces/project/IProjectCells';

const DateRangeCell: React.FC<IDateRangeCellProps> = ({ startDate, endDate }) => {
 
  const isValidDate = (date: Date | string | null | undefined): boolean => {
    if (!date) return false;
    if (typeof date === 'string' && date === '') return false;
    
    try {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    } catch {
      return false;
    }
  };

  // Handle empty or invalid dates
  if (!isValidDate(startDate)) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          -
        </Typography>
      </Box>
    );
  }

  // Check if endDate is valid
  const hasValidEndDate = isValidDate(endDate);

  return (
    <Box>
      <Typography variant="body2" fontWeight={500}>
        {format(new Date(startDate), 'MMM dd, yyyy')}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        to { hasValidEndDate ? format(new Date(endDate!), 'MMM dd, yyyy') : 'Present' }
      </Typography>
    </Box>
  );
};

export default DateRangeCell;
