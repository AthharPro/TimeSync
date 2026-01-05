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
import { UserRole } from '@tms/shared';
import { AccountFilterPopoverProps } from '../../../interfaces/popover/IPopover';


const AccountFilterPopover: React.FC<AccountFilterPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  onApplyFilter,
}) => {
  const [role, setRole] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const handleApply = () => {
    onApplyFilter({ role, status });
    onClose();
  };

  const handleReset = () => {
    setRole('all');
    setStatus('all');
    onApplyFilter({ role: 'all', status: 'all' });
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
          Filter Accounts
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* Role Filter */}
        <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value={UserRole.Emp}>Employee</MenuItem>
            <MenuItem value={UserRole.Admin}>Admin</MenuItem>
            <MenuItem value={UserRole.SuperAdmin}>Super Admin</MenuItem>
            <MenuItem value={UserRole.Supervisor}>Supervisor</MenuItem>
            <MenuItem value={UserRole.SupervisorAdmin}>Supervisor Admin</MenuItem>
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
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
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

export default AccountFilterPopover;
