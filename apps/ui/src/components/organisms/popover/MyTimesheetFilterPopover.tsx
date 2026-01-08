import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import { DailyTimesheetStatus } from '@tms/shared';
import DateRangePicker from '../../molecules/report/DateRangePicker';
import DatePickerAtom from '../../atoms/report/DatePickerAtom';
import { useMyProjects } from '../../../hooks/project/useMyProject';
import dayjs, { Dayjs } from 'dayjs';

export interface TimesheetFilters {
  startDate: string | null;
  endDate: string | null;
  month: string | null;
  year: string | null;
  status: DailyTimesheetStatus | 'All';
  filterBy: 'all' | 'project' | 'team';
  projectId: string;
  teamId: string;
  dateFilterType: 'monthYear' | 'dateRange';
}

interface MyTimesheetFilterPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: TimesheetFilters) => void;
  currentFilters: TimesheetFilters;
}

const MyTimesheetFilterPopover: React.FC<MyTimesheetFilterPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const { myProjects, myTeams, loadMyProjects } = useMyProjects();
  const [filters, setFilters] = useState<TimesheetFilters>(currentFilters);

  // Load projects (which also loads teams)
  useEffect(() => {
    loadMyProjects();
  }, [loadMyProjects]);

  const handleYearChange = (date: Dayjs | null) => {
    if (!date) {
      setFilters({ ...filters, year: null, startDate: null, endDate: null });
    } else {
      const year = date.year();
      // If month is also selected, use both year and month
      if (filters.month) {
        const monthNum = parseInt(filters.month.split('-')[1]);
        const startDate = dayjs(`${year}-${String(monthNum).padStart(2, '0')}-01`).format('YYYY-MM-DD');
        const endDate = dayjs(`${year}-${String(monthNum).padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
        setFilters({ ...filters, year: date.format('YYYY'), startDate, endDate });
      } else {
        // Only year selected, use full year range
        const startDate = dayjs(`${year}-01-01`).format('YYYY-MM-DD');
        const endDate = dayjs(`${year}-12-31`).format('YYYY-MM-DD');
        setFilters({ ...filters, year: date.format('YYYY'), startDate, endDate });
      }
    }
  };

  const handleMonthChange = (date: Dayjs | null) => {
    if (!date) {
      setFilters({ ...filters, month: null, startDate: null, endDate: null });
    } else {
      const monthNum = date.month() + 1; // month() returns 0-11
      const year = filters.year ? parseInt(filters.year) : date.year();
      
      const startDate = dayjs(`${year}-${String(monthNum).padStart(2, '0')}-01`).format('YYYY-MM-DD');
      const endDate = dayjs(`${year}-${String(monthNum).padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
      
      setFilters({ 
        ...filters, 
        month: `${year}-${String(monthNum).padStart(2, '0')}`,
        year: filters.year || date.format('YYYY'),
        startDate, 
        endDate 
      });
    }
  };

  const handleStartDateChange = (date: Dayjs | null) => {
    setFilters({ ...filters, startDate: date ? date.format('YYYY-MM-DD') : null });
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    setFilters({ ...filters, endDate: date ? date.format('YYYY-MM-DD') : null });
  };

  const handleDateFilterTypeChange = (dateFilterType: 'monthYear' | 'dateRange') => {
    // Clear all date filters when switching type
    setFilters({ 
      ...filters, 
      dateFilterType,
      startDate: null,
      endDate: null,
      month: null,
      year: null
    });
  };

  const handleStatusChange = (status: DailyTimesheetStatus | 'All') => {
    setFilters({ ...filters, status });
  };

  const handleFilterByChange = (filterBy: 'all' | 'project' | 'team') => {
    // Reset project and team when changing filter type
    setFilters({ ...filters, filterBy, projectId: 'All', teamId: 'All' });
  };

  const handleProjectChange = (projectId: string) => {
    setFilters({ ...filters, projectId });
  };

  const handleTeamChange = (teamId: string) => {
    setFilters({ ...filters, teamId });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: TimesheetFilters = {
      startDate: null,
      endDate: null,
      month: null,
      year: null,
      status: 'All',
      filterBy: 'all',
      projectId: 'All',
      teamId: 'All',
      dateFilterType: 'monthYear',
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
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
      PaperProps={{
        sx: {
          p: 3,
          minWidth: 500,
          maxWidth: 600,
        },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Filter Timesheets
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Date Filter Type Selection */}
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>
            Date Filter
          </FormLabel>
          <RadioGroup
            value={filters.dateFilterType}
            onChange={(e) => handleDateFilterTypeChange(e.target.value as 'monthYear' | 'dateRange')}
            row
          >
            <FormControlLabel value="monthYear" control={<Radio size="small" />} label="Month/Year" />
            <FormControlLabel value="dateRange" control={<Radio size="small" />} label="Date Range" />
          </RadioGroup>
        </FormControl>

        {/* Year and Month Filter - Only shown when dateFilterType is 'monthYear' */}
        {filters.dateFilterType === 'monthYear' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <DatePickerAtom
                label="Filter By Year"
                value={filters.year ? dayjs(filters.year) : null}
                onChange={handleYearChange}
                disabled={false}
                views={['year']}
                openTo="year"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <DatePickerAtom
                label="Filter By Month"
                value={filters.month ? dayjs(filters.month) : null}
                onChange={handleMonthChange}
                disabled={false}
                views={['year', 'month']}
                openTo="month"
              />
            </Box>
          </Box>
        )}

        {/* Custom Date Range - Only shown when dateFilterType is 'dateRange' */}
        {filters.dateFilterType === 'dateRange' && (
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
        )}

        {/* Status Filter */}
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value as DailyTimesheetStatus | 'All')}
            label="Status"
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value={DailyTimesheetStatus.Draft}>Draft</MenuItem>
            <MenuItem value={DailyTimesheetStatus.Pending}>Pending</MenuItem>
            <MenuItem value={DailyTimesheetStatus.Approved}>Approved</MenuItem>
            <MenuItem value={DailyTimesheetStatus.Rejected}>Rejected</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 1 }} />

        {/* Filter By: Project or Team */}
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 600 }}>
            Filter By
          </FormLabel>
          <RadioGroup
            value={filters.filterBy}
            onChange={(e) => handleFilterByChange(e.target.value as 'all' | 'project' | 'team')}
          >
            <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
            <FormControlLabel value="project" control={<Radio size="small" />} label="Project" />
            <FormControlLabel value="team" control={<Radio size="small" />} label="Team" />
          </RadioGroup>
        </FormControl>

        {/* Project Filter - Only shown when filterBy is 'project' */}
        {filters.filterBy === 'project' && (
          <FormControl fullWidth size="small">
            <InputLabel>Project</InputLabel>
            <Select
              value={filters.projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              label="Project"
            >
              <MenuItem value="All">All Projects</MenuItem>
              {myProjects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.projectName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Team Filter - Only shown when filterBy is 'team' */}
        {filters.filterBy === 'team' && (
          <FormControl fullWidth size="small">
            <InputLabel>Team</InputLabel>
            <Select
              value={filters.teamId}
              onChange={(e) => handleTeamChange(e.target.value)}
              label="Team"
            >
              <MenuItem value="All">All Teams</MenuItem>
              {myTeams.map((team) => (
                <MenuItem key={team._id} value={team._id}>
                  {team.teamName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleReset} size="small">
          Reset
        </Button>
        <Button variant="contained" onClick={handleApply} size="small">
          Apply
        </Button>
      </Box>
    </Popover>
  );
};

export default MyTimesheetFilterPopover;
