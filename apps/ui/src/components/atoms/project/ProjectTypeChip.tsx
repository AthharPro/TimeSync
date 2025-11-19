import React from 'react';
import { Typography } from '@mui/material';
import { ProjectType } from '../../../interfaces/project/IProject';

interface IProjectTypeChipProps {
  type: ProjectType;
}

const ProjectTypeChip: React.FC<IProjectTypeChipProps> = ({ type }) => {
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
      }}
    >
      {type}
    </Typography>
  );
};

export default ProjectTypeChip;
