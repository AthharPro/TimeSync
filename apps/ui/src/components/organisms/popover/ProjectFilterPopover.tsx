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
import { ProjectFilterPopoverProps } from '../../../interfaces/popover/IPopover';


const ProjectFilterPopover: React.FC<ProjectFilterPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  onApplyFilter,
}) => {
  const [projectType, setProjectType] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [billable, setBillable] = useState<string>('all');
  const [visibility, setVisibility] = useState<string>('all');
  const [costCenter, setCostCenter] = useState<string>('all');

  const handleApply = () => {
    onApplyFilter({ projectType, status, billable, visibility, costCenter });
    onClose();
  };

  const handleReset = () => {
    setProjectType('all');
    setStatus('all');
    setBillable('all');
    setVisibility('all');
    setCostCenter('all');
    onApplyFilter({ projectType: 'all', status: 'all', billable: 'all', visibility: 'all', costCenter: 'all' });
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
          Filter Projects
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* Project Type Filter */}
        <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
          <InputLabel id="project-type-filter-label">Project Type</InputLabel>
          <Select
            labelId="project-type-filter-label"
            value={projectType}
            label="Project Type"
            onChange={(e) => setProjectType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="Fixed Bid">Fixed Bid</MenuItem>
            <MenuItem value="T&M">T&M</MenuItem>
            <MenuItem value="Retainer">Retainer</MenuItem>
          </Select>
        </FormControl>

        {/* Status Filter */}
        <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
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

        {/* Billable Filter */}
        <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
          <InputLabel id="billable-filter-label">Billable Type</InputLabel>
          <Select
            labelId="billable-filter-label"
            value={billable}
            label="Billable Type"
            onChange={(e) => setBillable(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="billable">Billable</MenuItem>
            <MenuItem value="non-billable">Non-Billable</MenuItem>
          </Select>
        </FormControl>

        {/* Visibility Filter */}
        <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
          <InputLabel id="visibility-filter-label">Visibility</InputLabel>
          <Select
            labelId="visibility-filter-label"
            value={visibility}
            label="Visibility"
            onChange={(e) => setVisibility(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="private">Private</MenuItem>
            <MenuItem value="public">Public</MenuItem>
          </Select>
        </FormControl>

        {/* Cost Center Filter */}
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel id="cost-center-filter-label">Cost Center</InputLabel>
          <Select
            labelId="cost-center-filter-label"
            value={costCenter}
            label="Cost Center"
            onChange={(e) => setCostCenter(e.target.value)}
          >
            <MenuItem value="all">All Cost Centers</MenuItem>
            <MenuItem value="Canada">Canada</MenuItem>
            <MenuItem value="Sri Lanka">Sri Lanka</MenuItem>
            <MenuItem value="Australia">Australia</MenuItem>
            <MenuItem value="Sweden">Sweden</MenuItem>
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

export default ProjectFilterPopover;
