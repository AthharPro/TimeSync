import React from 'react';
import { Box, Typography } from '@mui/material';
import { CostCenter } from '../../../interfaces/project/IProject';

interface ICostCenterBadgeProps {
  costCenter: CostCenter;
}

const CostCenterBadge: React.FC<ICostCenterBadgeProps> = ({ costCenter }) => {
  const getFlag = () => {
    switch (costCenter) {
      case 'Canada':
        return '🇨🇦';
      case 'Australia':
        return '🇦🇺';
      case 'Sweden':
        return '🇸🇪';
      case 'Sri Lanka':
        return '🇱🇰';
      default:
        return 'n/a';
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography variant="body2">{getFlag()}</Typography>
      <Typography variant="body2">{costCenter}</Typography>
    </Box>
  );
};

export default CostCenterBadge;
