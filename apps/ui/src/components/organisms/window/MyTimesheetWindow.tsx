import WindowLayout from '../../templates/other/WindowLayout';
import {  ToggleButton, ToggleButtonGroup, Typography, Box, Alert } from '@mui/material';
import MyTimesheetTable from '../table/MyTimesheetTable';
import { useMyTimesheet } from '../../../hooks/timesheet/useMyTimesheet';
import { BillableType, DailyTimesheetStatus } from '@tms/shared';
import { useState, useMemo, useEffect } from 'react';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MyTimesheetCalenderTable from '../table/MyTimesheetCalenderTable';
import { BaseBtn } from '../../atoms';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import WeekNavigator from '../../atoms/other/button/WeekNavigator';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import MyTimesheetFilterPopover, { TimesheetFilters } from '../popover/MyTimesheetFilterPopover';
import dayjs from 'dayjs';
import { useWindowNavigation } from '../../../hooks/useWindowNavigation';
import AppSnackbar from '../../molecules/other/AppSnackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import ConformationDailog from '../../molecules/other/ConformationDailog';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import EditRequestDialog from '../dialog/EditRequestDialog';
import { useEditRequest } from '../../../hooks/editRequest/useEditRequest';

function MyTimesheetWindow() {
  const { addNewTimesheet, currentWeekDays, goToPreviousWeek, goToNextWeek, createEmptyCalendarRow, submitTimesheets, submitCurrentWeekTimesheets, newTimesheets, deleteSelectedTimesheets, isLoading, error } = useMyTimesheet();
  const { myTimesheetParams, setMyTimesheetParams } = useWindowNavigation();
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { createRequest } = useEditRequest();

  const [view, setView] = useState('table');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submitDialogMessage, setSubmitDialogMessage] = useState('');
  const [deleteDialogMessage, setDeleteDialogMessage] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const [editRequestDialogOpen, setEditRequestDialogOpen] = useState(false);
  
  // Default filters for table view: current year and current month
  const defaultTableFilters = useMemo(() => {
    const now = dayjs();
    const year = now.format('YYYY');
    const month = now.format('YYYY-MM');
    const startDate = now.startOf('month').format('YYYY-MM-DD');
    const endDate = now.endOf('month').format('YYYY-MM-DD');
    
    return {
      startDate,
      endDate,
      month,
      year,
      status: 'All' as const,
      project: 'All',
    };
  }, []);

  const [filters, setFilters] = useState<TimesheetFilters>(defaultTableFilters);

  // Handle navigation from notification (rejected timesheets)
  useEffect(() => {
    if (myTimesheetParams) {
      const { year, month, status } = myTimesheetParams;
      
      // Apply filters based on notification params
      if (year || month || status) {
        const newFilters = { ...filters };
        
        if (year) {
          newFilters.year = year;
        }
        
        if (month) {
          const monthDate = dayjs(month, 'YYYY-MM');
          newFilters.month = month;
          newFilters.year = monthDate.format('YYYY');
          newFilters.startDate = monthDate.startOf('month').format('YYYY-MM-DD');
          newFilters.endDate = monthDate.endOf('month').format('YYYY-MM-DD');
        }
        
        if (status) {
          newFilters.status = status as any;
        }
        
        setFilters(newFilters);
      }
      
      // Clear the params after processing
      setMyTimesheetParams(null);
    }
  }, [myTimesheetParams, setMyTimesheetParams]);

  const handleCreateClick = async () => {
    if(view==='table'){
      // Use the filtered month to determine the date
      const now = dayjs();
      const filteredMonth = dayjs(filters.month);
      
      // If filtered month is current month, use current date
      // Otherwise, use the first day of the filtered month
      let dateToUse: string;
      if (filteredMonth.isSame(now, 'month')) {
        dateToUse = now.toISOString();
      } else {
        dateToUse = filteredMonth.startOf('month').toISOString();
      }
      
      const newTime = {
        id: crypto.randomUUID(), // Generate unique ID
        date: dateToUse, // Use filtered month's date
        project: '',
        task: '',
        description: '',
        hours: 0,
        billableType: BillableType.NonBillable,
        status: DailyTimesheetStatus.Default,
        isChecked: true,
      };
      
      try {
        await addNewTimesheet(newTime);
      } catch (error: any) {
        showError(error.message || 'Failed to create timesheet');
      }
    } else if(view==='calendar') {
      // Add new empty calendar row that users can fill in
      createEmptyCalendarRow('New Project', 'New Task', BillableType.NonBillable);
    }
  };

  const handleSubmitClick = async () => {
    if (view === 'table') {
      // Table view: submit selected timesheets
      const count = newTimesheets.filter((ts) => ts.isChecked).length;
      
      if (count === 0) {
        showError('Please select at least one timesheet to submit');
        return;
      }

      setSelectedCount(count);
      setSubmitDialogMessage('Submit selected timesheets?\n\nNote: Timesheets with 0 hours or missing project/task/description will be skipped.');
      setIsSubmitDialogOpen(true);
    } else {
      // Calendar view: submit all draft timesheets in current week
      const weekStart = currentWeekDays[0];
      const weekEnd = currentWeekDays[currentWeekDays.length - 1];
      
      setSubmitDialogMessage(`Submit all draft timesheets for the week of ${weekStart.monthName} ${weekStart.dayNumber} - ${weekEnd.monthName} ${weekEnd.dayNumber}?\n\nOnly timesheets in Draft status with valid hours, project, and task will be submitted.\nTimesheets that are already Pending, Approved, or Rejected will be skipped.`);
      setIsSubmitDialogOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitDialogOpen(false);
    try {
      if (view === 'table') {
        // Submit selected timesheets
        const result = await submitTimesheets();
        showSuccess(`Successfully submitted ${result.updated} timesheet${result.updated > 1 ? 's' : ''}`);
      } else {
        // Submit current week timesheets
        const result = await submitCurrentWeekTimesheets();
        showSuccess(`Successfully submitted ${result.updated} draft timesheet${result.updated > 1 ? 's' : ''} for the current week. Status changed from Draft to Pending.`);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      showError(`Failed to submit timesheets: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteClick = async () => {
    // Get selected timesheets count
    const count = newTimesheets.filter((ts) => ts.isChecked).length;
    
    if (count === 0) {
      showError('Please select at least one timesheet to delete');
      return;
    }

    setSelectedCount(count);
    setDeleteDialogMessage(`Delete ${count} selected timesheet${count > 1 ? 's' : ''}?\n\nNote: Only draft timesheets can be deleted.`);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteDialogOpen(false);
    try {
      // Delete selected timesheets
      const result = await deleteSelectedTimesheets();
      showSuccess(`Successfully deleted ${result.deleted} timesheet${result.deleted > 1 ? 's' : ''}`);
    } catch (error: any) {
      console.error('Delete error:', error);
      showError(`Failed to delete timesheets: ${error.message || 'Unknown error'}`);
    }
  };

  const handleChange = () => {
    setView((prev) => (prev === 'table' ? 'calendar' : 'table'));
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilters = (newFilters: TimesheetFilters) => {
    setFilters(newFilters);
    // The filters will be passed to MyTimesheetTable component
  };

  const handleRequestToEdit = () => {
    setEditRequestDialogOpen(true);
  };

  const handleEditRequestConfirm = async (month: string, year: string) => {
    try {
      await createRequest(month, year);
      showSuccess(`Edit request for ${month} has been sent to your supervisors`);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to submit edit request');
    }
  };

  const buttons = (
    <>
      {view === 'calendar' && (
        <WeekNavigator 
          weekDays={currentWeekDays} 
          onPreviousWeek={goToPreviousWeek} 
          onNextWeek={goToNextWeek} 
        />
      )}
      {view === 'table' && (
        <>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center',
              color: 'primary.main',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: 'primary.lighter',
            }}
          >
            {dayjs(filters.month).format('MMMM YYYY')}
          </Typography>
          <BaseBtn variant='outlined' startIcon={<DeleteForeverOutlinedIcon/>} onClick={handleDeleteClick}>Delete</BaseBtn>
          <BaseBtn variant='outlined' startIcon={<FilterAltOutlinedIcon/>} onClick={handleFilterClick}>Filter</BaseBtn>
        </>
      )}
      <BaseBtn variant='outlined' startIcon={<EditNoteOutlinedIcon/>} onClick={handleRequestToEdit}>Request To Edit</BaseBtn>
      <BaseBtn variant='outlined' startIcon={<PublishOutlinedIcon/>} onClick={handleSubmitClick}>Submit</BaseBtn>
      <BaseBtn variant="contained" color="primary" startIcon={<AddOutlinedIcon/>} onClick={handleCreateClick}>Create</BaseBtn>
      <ToggleButtonGroup
        color="primary"
        size='small'
        value={view}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
      >
        <ToggleButton value="table"><TableRowsOutlinedIcon sx={{width: 20, height: 20}}/></ToggleButton>
        <ToggleButton value="calendar"><CalendarMonthOutlinedIcon sx={{width: 20, height: 20}}/></ToggleButton>
      </ToggleButtonGroup>
    </>
  );

  return (
    <WindowLayout title="My Timesheet" buttons={buttons}>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {view === 'table' && <MyTimesheetTable filters={filters} isLoading={isLoading} />}
      {view === 'calendar' && <MyTimesheetCalenderTable onError={showError} />}
      
      <MyTimesheetFilterPopover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
      <AppSnackbar snackbar={snackbar} onClose={hideSnackbar} />
      <ConformationDailog
        open={isDeleteDialogOpen}
        title="Delete Timesheets"
        message={deleteDialogMessage}
        confirmText="Delete"
        cancelText="Cancel"
        icon={<DeleteOutlineIcon />}
        confirmButtonColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
      <ConformationDailog
        open={isSubmitDialogOpen}
        title="Submit Timesheets"
        message={submitDialogMessage}
        confirmText="Submit"
        cancelText="Cancel"
        icon={<SendOutlinedIcon />}
        confirmButtonColor="primary"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsSubmitDialogOpen(false)}
      />
      <EditRequestDialog
        open={editRequestDialogOpen}
        onClose={() => setEditRequestDialogOpen(false)}
        onConfirm={handleEditRequestConfirm}
      />
    </WindowLayout>
  );
}

export default MyTimesheetWindow;
