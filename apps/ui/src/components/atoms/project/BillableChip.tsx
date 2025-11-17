import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface IBillableChipProps {
  billable: boolean;
}

const BillableChip: React.FC<IBillableChipProps> = ({ billable }) => {
  return (
    <Chip
      label={billable ? 'Yes' : 'No'}
      color={billable ? 'success' : 'default'}
      size="small"
      icon={billable ? <CheckCircleIcon /> : <CancelIcon />}
      variant={billable ? 'filled' : 'outlined'}
    />
  );
};

export default BillableChip;
