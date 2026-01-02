import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import { BaseBtn } from '../../atoms';

export interface EditRequestFilterOptions {
  status: 'All' | 'Pending' | 'Approved' | 'Rejected';
}

interface EditRequestFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EditRequestFilterOptions) => void;
  currentFilters: EditRequestFilterOptions;
}

const EditRequestFilterPopover: React.FC<EditRequestFilterPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const [status, setStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>(currentFilters.status);

  useEffect(() => {
    if (open) {
      setStatus(currentFilters.status);
    }
  }, [open, currentFilters]);

  const handleStatusChange = (_event: React.MouseEvent<HTMLElement>, newStatus: 'All' | 'Pending' | 'Approved' | 'Rejected' | null) => {
    if (newStatus !== null) {
      setStatus(newStatus);
    }
  };

  const handleApply = () => {
    onApplyFilters({ status });
    onClose();
  };

  const handleReset = () => {
    setStatus('All');
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ p: 3, minWidth: 300 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filter Edit Requests
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Status Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Status
          </Typography>
          <ToggleButtonGroup
            value={status}
            exclusive
            onChange={handleStatusChange}
            fullWidth
            size="small"
          >
            <ToggleButton value="All">All</ToggleButton>
            <ToggleButton value="Pending">Pending</ToggleButton>
            <ToggleButton value="Approved">Approved</ToggleButton>
            <ToggleButton value="Rejected">Rejected</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <BaseBtn variant="outlined" onClick={handleReset}>
            Reset
          </BaseBtn>
          <BaseBtn variant="contained" onClick={handleApply}>
            Apply
          </BaseBtn>
        </Box>
      </Box>
    </Popover>
  );
};

export default EditRequestFilterPopover;
