import React from 'react';
import { Box } from '@mui/material';
import { FilterColumnProps } from '../../../interfaces/report/IReportFilter';

const FilterColumn: React.FC<FilterColumnProps> = ({ children, flex = 1 }) => {
  return (
    <Box sx={{ flex }}>
      {children}
    </Box>
  );
};

export default FilterColumn;
