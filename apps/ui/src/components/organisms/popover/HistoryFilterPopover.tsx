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

interface HistoryFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { entityType: string; actionCategory: string }) => void;
}

const HistoryFilterPopover: React.FC<HistoryFilterPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  onApplyFilter,
}) => {
  const [entityType, setEntityType] = useState<string>('all');
  const [actionCategory, setActionCategory] = useState<string>('all');

  const handleApply = () => {
    onApplyFilter({ entityType, actionCategory });
    onClose();
  };

  const handleReset = () => {
    setEntityType('all');
    setActionCategory('all');
    onApplyFilter({ entityType: 'all', actionCategory: 'all' });
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
          Filter History
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* Entity Type Filter */}
        <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
          <InputLabel id="entity-type-filter-label">Entity Type</InputLabel>
          <Select
            labelId="entity-type-filter-label"
            value={entityType}
            label="Entity Type"
            onChange={(e) => setEntityType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="PROJECT">Project</MenuItem>
            <MenuItem value="TEAM">Team</MenuItem>
          </Select>
        </FormControl>

        {/* Action Category Filter */}
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel id="action-category-filter-label">Action</InputLabel>
          <Select
            labelId="action-category-filter-label"
            value={actionCategory}
            label="Action"
            onChange={(e) => setActionCategory(e.target.value)}
          >
            <MenuItem value="all">All Actions</MenuItem>
            <MenuItem value="CREATED">Created</MenuItem>
            <MenuItem value="UPDATED">Updated</MenuItem>
            <MenuItem value="STATUS_CHANGED">Status Changed</MenuItem>
            <MenuItem value="SUPERVISOR_CHANGED">Supervisor Changed</MenuItem>
            <MenuItem value="MEMBER_ADDED">Member/Employee Added</MenuItem>
            <MenuItem value="MEMBER_REMOVED">Member/Employee Removed</MenuItem>
            <MenuItem value="PASSWORD_CHANGED">Password Changed</MenuItem>
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

export default HistoryFilterPopover;
