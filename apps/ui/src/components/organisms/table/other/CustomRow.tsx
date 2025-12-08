import React from 'react';
import { Box, Typography } from '@mui/material';
import { CustomRowProps } from '@tms/ui/interfaces';

const CustomRow: React.FC<CustomRowProps> = ({ text }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      height: '25px',
    }}>
      <Typography variant="body1" >
        {text}
      </Typography>
    </Box>
  );
};

export default CustomRow;
