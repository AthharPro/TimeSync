import React from 'react';
import { Box, Typography } from '@mui/material';

interface IEmployeeCellProps {
  name: string;
  email: string;
}

const EmployeeCell: React.FC<IEmployeeCellProps> = ({ name, email }) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {email}
        </Typography>
      </Box>
    </Box>
  );
};

export default EmployeeCell;
