import React from 'react';
import { Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface IBillableChipProps {
  billable: boolean;
}

const BillableChip: React.FC<IBillableChipProps> = ({ billable }) => {
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
      }}
    >
      {billable ? 'Billable' : 'Non-Billable'}
    </Typography>
  );
};

export default BillableChip;
