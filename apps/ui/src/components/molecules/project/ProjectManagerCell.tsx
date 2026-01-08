import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { IProjectManagerCellProps } from '../../../interfaces/project/IProjectCells';

const ProjectManagerCell: React.FC<IProjectManagerCellProps> = ({ manager }) => {
  
  if (!manager) {
    return (
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box>
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            No manager assigned
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
     
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
