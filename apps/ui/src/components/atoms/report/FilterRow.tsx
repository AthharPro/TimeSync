import React from 'react';
import { Box } from '@mui/material';
import { FilterRowProps } from '../../../interfaces/report/IReportFilter';

const FilterRow: React.FC<FilterRowProps> = ({ children, gap = 2 }) => {
  return (
    <Box display="flex" flexDirection="row" gap={gap}>
      {children}
    </Box>
  );
};

export default FilterRow;
