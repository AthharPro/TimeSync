import WindowLayout from '../../templates/other/WindowLayout';
import {  ToggleButton, ToggleButtonGroup } from '@mui/material';
import MyTimesheetTable from '../table/MyTimesheetTable';
import { useMyTimesheet } from '../../../hooks/timesheet/useMyTimesheet';
import { BillableType, DailyTimesheetStatus } from '@tms/shared';
import { useState } from 'react';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MyTimesheetCalenderTable from '../table/MyTimesheetCalenderTable';
import { BaseBtn } from '../../atoms';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import WeekNavigator from '../../atoms/other/button/WeekNavigator';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

function MyTimesheetWindow() {
  const { addNewTimesheet, currentWeekDays, goToPreviousWeek, goToNextWeek, createEmptyCalendarRow, submitTimesheets, submitCurrentWeekTimesheets, newTimesheets } = useMyTimesheet();

    const [view, setView] = useState('table');

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
        // Calendar view: submit all timesheets in current week
        const weekStart = currentWeekDays[0];
        const weekEnd = currentWeekDays[currentWeekDays.length - 1];
        
        // Confirm submission (validation happens in the hook)
        const confirmed = window.confirm(
          `Submit all timesheets for the week of ${weekStart.monthName} ${weekStart.dayNumber} - ${weekEnd.monthName} ${weekEnd.dayNumber}?\n\nNote: Timesheets with 0 hours or missing project/task/description will be skipped.`
        );

        if (!confirmed) {
          return;
        }

        // Submit current week timesheets
        const result = await submitCurrentWeekTimesheets();
        
        alert(`Successfully submitted ${result.updated} timesheet${result.updated > 1 ? 's' : ''} for the current week`);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      alert(`Failed to submit timesheets: ${error.message || 'Unknown error'}`);
    }
  };

  const handleChange = () => {
    setView((prev) => (prev === 'table' ? 'calendar' : 'table'));
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
      <BaseBtn variant='outlined' startIcon={<FilterAltOutlinedIcon/>}>Filter</BaseBtn>
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
      {view === 'table' && <MyTimesheetTable/>}
      {view === 'calendar' && <MyTimesheetCalenderTable/>}
    </WindowLayout>
  );
}

export default MyTimesheetWindow;
