import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { IProjectManagerCellProps } from '../../../interfaces/project/IProjectCells';

const ProjectManagerCell: React.FC<IProjectManagerCellProps> = ({ manager }) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      {/* <Avatar 
        alt={manager.name} 
        src={manager.avatar}
        sx={{ width: 32, height: 32 }}
      >
        {manager.name.charAt(0)}
      </Avatar> */}
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {manager.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {manager.email}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProjectManagerCell;
