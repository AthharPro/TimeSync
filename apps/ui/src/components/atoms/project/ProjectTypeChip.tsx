import React from 'react';
import { Chip } from '@mui/material';
import { ProjectType } from '../../../interfaces/project/IProject';

interface IProjectTypeChipProps {
  type: ProjectType;
}

const ProjectTypeChip: React.FC<IProjectTypeChipProps> = ({ type }) => {
  const getColorConfig = () => {
    switch (type) {
      case 'Fixed Bid':
        return {
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          borderColor: '#1976d2',
        };
      case 'T&M':
        return {
          backgroundColor: '#fff3e0',
          color: '#f57c00',
          borderColor: '#f57c00',
        };
      case 'Retainer':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderColor: '#2e7d32',
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#616161',
          borderColor: '#616161',
        };
    }
  };

  const colorConfig = getColorConfig();

  return (
    <Chip
      label={type}
      variant="outlined"
      size="small"
      sx={{
        backgroundColor: colorConfig.backgroundColor,
        color: colorConfig.color,
        borderColor: colorConfig.borderColor,
        fontWeight: 500,
      }}
    />
  );
};

export default ProjectTypeChip;
