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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface HistoryFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: { entityType: string; startDate: string; endDate: string }) => void;
}

const HistoryFilterPopover: React.FC<HistoryFilterPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  onApplyFilter,
}) => {
  const [entityType, setEntityType] = useState<string>('all');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const handleApply = () => {
    onApplyFilter({ 
      entityType, 
      startDate: startDate ? startDate.format('YYYY-MM-DD') : '', 
      endDate: endDate ? endDate.format('YYYY-MM-DD') : '' 
    });
    onClose();
  };

  const handleReset = () => {
    setEntityType('all');
    setStartDate(null);
    setEndDate(null);
    onApplyFilter({ entityType: 'all', startDate: '', endDate: '' });
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
      <Box sx={{ p: 2, minWidth: 200, maxWidth: 280 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 600, fontSize: '0.95rem' }}>
          Filter History
        </Typography>

        <Divider sx={{ mb: 1.25 }} />

        {/* Entity Type Filter */}
        <FormControl fullWidth sx={{ mb: 1.25 }} size="small">
          <InputLabel id="entity-type-filter-label">Type</InputLabel>
          <Select
            labelId="entity-type-filter-label"
            value={entityType}
            label="Type"
            onChange={(e) => setEntityType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="PROJECT">Project</MenuItem>
            <MenuItem value="TEAM">Team</MenuItem>
          </Select>
        </FormControl>

        {/* Start Date Filter */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue as Dayjs | null)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                sx: { mb: 1.25 }
              }
            }}
          />
        </LocalizationProvider>

        {/* End Date Filter */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue as Dayjs | null)}
            minDate={startDate || undefined}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                sx: { mb: 1.75 }
              }
            }}
          />
        </LocalizationProvider>

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
