import React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { IDateRangeCellProps } from '../../../interfaces/project/IProjectCells';

const DateRangeCell: React.FC<IDateRangeCellProps> = ({ startDate, endDate }) => {
  return (
    <Box>
      <Typography variant="body2" fontWeight={500}>
        {format(new Date(startDate), 'MMM dd, yyyy')}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        to { endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'Present' }
      </Typography>
    </Box>
  );
};

export default DateRangeCell;
