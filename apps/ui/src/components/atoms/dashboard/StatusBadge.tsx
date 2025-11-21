import React from 'react';
import { Chip } from '@mui/material';

interface IStatusBadgeProps {
  status: 'On Track' | 'At Risk' | 'Delayed' | 'Available' | 'Busy' | 'Away';
}

const StatusBadge: React.FC<IStatusBadgeProps> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'On Track':
      case 'Available':
        return 'success';
      case 'At Risk':
      case 'Busy':
        return 'warning';
      case 'Delayed':
      case 'Away':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getColor()}
      size="small"
      sx={{ fontWeight: 500, fontSize: '0.75rem' }}
    />
  );
};

export default StatusBadge;
