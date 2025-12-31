import WindowLayout from '../../templates/other/WindowLayout';
import {  ToggleButton, ToggleButtonGroup } from '@mui/material';
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

function MyTimesheetWindow() {
  const { addNewTimesheet, currentWeekDays, goToPreviousWeek, goToNextWeek, createEmptyCalendarRow, submitTimesheets, submitCurrentWeekTimesheets, newTimesheets, deleteSelectedTimesheets } = useMyTimesheet();
  const { myTimesheetParams, setMyTimesheetParams } = useWindowNavigation();

  const [view, setView] = useState('table');
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
  
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

  const handleCreateClick = () => {
    if(view==='table'){
      const newTime = {
        id: crypto.randomUUID(), // Generate unique ID
        date: new Date().toISOString(), // Convert Date to ISO string for Redux
        project: '',
        task: '',
        description: '',
        hours: 0,
        billableType: BillableType.NonBillable,
        status: DailyTimesheetStatus.Default,
        isChecked: true,
      };
      addNewTimesheet(newTime);
    } else if(view==='calendar') {
      // Add new empty calendar row that users can fill in
      createEmptyCalendarRow('New Project', 'New Task', BillableType.NonBillable);
    }
  };

  const handleSubmitClick = async () => {
    try {
      if (view === 'table') {
        // Table view: submit selected timesheets
        const selectedCount = newTimesheets.filter((ts) => ts.isChecked).length;
        
        if (selectedCount === 0) {
          alert('Please select at least one timesheet to submit');
          return;
        }

        // Confirm submission (validation happens in the hook)
        const confirmed = window.confirm(
          `Submit selected timesheets?\n\nNote: Timesheets with 0 hours or missing project/task/description will be skipped.`
        );

        if (!confirmed) {
          return;
        }

        // Submit selected timesheets
        const result = await submitTimesheets();
        
        alert(`Successfully submitted ${result.updated} timesheet${result.updated > 1 ? 's' : ''}`);
      } else {
        // Calendar view: submit all draft timesheets in current week
        const weekStart = currentWeekDays[0];
        const weekEnd = currentWeekDays[currentWeekDays.length - 1];
        
        // Confirm submission (validation happens in the hook)
        const confirmed = window.confirm(
          `Submit all draft timesheets for the week of ${weekStart.monthName} ${weekStart.dayNumber} - ${weekEnd.monthName} ${weekEnd.dayNumber}?\n\nOnly timesheets in Draft status with valid hours, project, and task will be submitted.\nTimesheets that are already Pending, Approved, or Rejected will be skipped.`
        );

        if (!confirmed) {
          return;
        }

        // Submit current week timesheets
        const result = await submitCurrentWeekTimesheets();
        
        alert(`Successfully submitted ${result.updated} draft timesheet${result.updated > 1 ? 's' : ''} for the current week.\nStatus changed from Draft to Pending.`);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(`Failed to submit timesheets: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteClick = async () => {
    try {
      // Get selected timesheets count
      const selectedCount = newTimesheets.filter((ts) => ts.isChecked).length;
      
      if (selectedCount === 0) {
        alert('Please select at least one timesheet to delete');
        return;
      }

      // Confirm deletion
      const confirmed = window.confirm(
        `Delete ${selectedCount} selected timesheet${selectedCount > 1 ? 's' : ''}?\n\nNote: Only draft timesheets can be deleted.`
      );

      if (!confirmed) {
        return;
      }

      // Delete selected timesheets
      const result = await deleteSelectedTimesheets();
      
      alert(`Successfully deleted ${result.deleted} timesheet${result.deleted > 1 ? 's' : ''}`);
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Failed to delete timesheets: ${error.message || 'Unknown error'}`);
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
          <BaseBtn variant='outlined' startIcon={<DeleteForeverOutlinedIcon/>} onClick={handleDeleteClick}>Delete</BaseBtn>
          <BaseBtn variant='outlined' startIcon={<FilterAltOutlinedIcon/>} onClick={handleFilterClick}>Filter</BaseBtn>
        </>
      )}
     
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
      {view === 'table' && <MyTimesheetTable filters={filters} />}
      {view === 'calendar' && <MyTimesheetCalenderTable/>}
      
      <MyTimesheetFilterPopover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </WindowLayout>
  );
}

export default MyTimesheetWindow;
