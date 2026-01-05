import React, { useState } from 'react';
import {
  Popover,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
} from '@mui/material';

interface TeamFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { supervisor: string; status: string }) => void;
}

const TeamFilterPopover: React.FC<TeamFilterPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  onApplyFilter,
}) => {
  const [supervisor, setSupervisor] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const handleApply = () => {
    onApplyFilter({ supervisor, status });
    onClose();
  };

  const handleReset = () => {
    setSupervisor('all');
    setStatus('all');
    onApplyFilter({ supervisor: 'all', status: 'all' });
    onClose();
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
      <Box sx={{ p: 2, minWidth: 250 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
          Filter Teams
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* Supervisor Filter */}
        <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
          <InputLabel id="supervisor-filter-label">Supervisor</InputLabel>
          <Select
            labelId="supervisor-filter-label"
            value={supervisor}
            label="Supervisor"
            onChange={(e) => setSupervisor(e.target.value)}
          >
            <MenuItem value="all">All Teams</MenuItem>
            <MenuItem value="with">With Supervisor</MenuItem>
            <MenuItem value="without">Without Supervisor</MenuItem>
          </Select>
        </FormControl>

        {/* Status Filter */}
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleReset} size="small">
            Reset
          </Button>
          <Button variant="contained" onClick={handleApply} size="small">
            Apply
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default TeamFilterPopover;
