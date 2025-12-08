import DataTable from '../../templates/other/DataTable';
import { DataTableColumn } from '../../../interfaces';
import { BillableType } from '@tms/shared';
import { IMyTimesheetCalendarEntry, ITimesheetRow } from '../../../interfaces/layout/ITableProps';
import {DailyTimesheetStatus} from '@tms/shared';
import TaskRow from './other/TaskRow';
import CreateTaskRow from './other/CreateTaskRow';
import TimesheetCell from './other/TimesheetCell';
import { useMyTimesheet } from '../../../hooks/timesheet/useMyTimesheet';
import { useMemo } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomRow from './other/CustomRow';

const MyTimesheetCalenderTable = () => {
  const {  currentWeekDays , myCalendarViewData, newTimesheets, updateTimesheet, addNewTimesheet, updateCalendar, createEmptyCalendarRow, deleteCalendar  } = useMyTimesheet();

  const weekDays = currentWeekDays;

  // Group calendar data by project
  const groupedData = useMemo(() => {
    const availableProjects = [
      'Project Alpha',
      'Project Beta',
      'Project Gamma',
      'Project Delta',
    ];

    const projectMap = new Map<string, IMyTimesheetCalendarEntry[]>();
    
    // Initialize all available projects with empty arrays
    availableProjects.forEach(project => {
      projectMap.set(project, []);
    });
    
    // Add existing tasks to their respective projects
    myCalendarViewData.forEach(entry => {
      if (!projectMap.has(entry.project)) {
        projectMap.set(entry.project, []);
      }
      const projectTasks = projectMap.get(entry.project);
      if (projectTasks) {
        projectTasks.push(entry);
      }
    });

    // Convert to flat array with project rows, task rows, and create task rows
    const rows: ITimesheetRow[] = [];
    projectMap.forEach((tasks, project) => {
      // Add project header row
      rows.push({
        id: `project-${project}`,
        project,
        isProjectRow: true
      });
      
      // Add task rows (if any)
      tasks.forEach(task => {
        rows.push({
          id: task.id,
          project: task.project,
          task: task.task,
          billableType: task.billableType,
          myTimesheetEntriesIds: task.myTimesheetEntriesIds,
          isProjectRow: false
        });
      });

      // Add "Create Task" row after all tasks for this project
      rows.push({
        id: `create-task-${project}`,
        project,
        isProjectRow: false,
        isCreateTaskRow: true
      });
    });

    return rows;
  }, [myCalendarViewData]);

  const availableTasks = [
    'Development',
    'Testing',
    'Code Review',
    'Documentation',
    'Bug Fixing',
    'Meeting',
  ];

  const handleCreateTask = (project: string) => {
    console.log('Creating new task for project:', project);
    createEmptyCalendarRow(project, '', BillableType.Billable);
  };

  const handleDeleteTask = (rowId: string) => {
    console.log('Deleting task row:', rowId);
    deleteCalendar(rowId);
  };

  const handleTaskChange = (calendarRowId: string, newTask: string | null) => {
    if (newTask === null) return;
    
    console.log('handleTaskChange:', { calendarRowId, newTask });
    
    // Find the calendar row - use fresh reference from state
    const calendarRow = myCalendarViewData.find(row => row.id === calendarRowId);
    if (!calendarRow) {
      console.log('Calendar row not found:', calendarRowId);
      return;
    }

    console.log('Calendar row found:', calendarRow);

    // Check if row has timesheet entries
    if (calendarRow.myTimesheetEntriesIds.length > 0) {
      // Update all timesheet entries in this calendar row
      console.log('Updating timesheet entries:', calendarRow.myTimesheetEntriesIds);
      calendarRow.myTimesheetEntriesIds.forEach(timesheetId => {
        const timesheet = newTimesheets.find(t => t.id === timesheetId);
        if (timesheet) {
          console.log('Updating timesheet task from', timesheet.task, 'to', newTask);
          updateTimesheet(timesheetId, { task: newTask });
        }
      });
    } else {
      // Empty row - update calendar row metadata directly
      console.log('Updating empty calendar row metadata');
      updateCalendar(calendarRow.id, calendarRow.project, newTask, calendarRow.billableType);
    }
  };

  const handleBillableTypeChange = (calendarRowId: string, newBillableType: BillableType) => {
    console.log('handleBillableTypeChange:', { calendarRowId, newBillableType });
    
    // Find the calendar row - use fresh reference from state
    const calendarRow = myCalendarViewData.find(row => row.id === calendarRowId);
    if (!calendarRow) {
      console.log('Calendar row not found:', calendarRowId);
      return;
    }

    console.log('Calendar row found:', calendarRow);

    // Check if row has timesheet entries
    if (calendarRow.myTimesheetEntriesIds.length > 0) {
      // Update all timesheet entries in this calendar row
      console.log('Updating timesheet entries:', calendarRow.myTimesheetEntriesIds);
      calendarRow.myTimesheetEntriesIds.forEach(timesheetId => {
        const timesheet = newTimesheets.find(t => t.id === timesheetId);
        if (timesheet) {
          console.log('Updating timesheet billableType from', timesheet.billableType, 'to', newBillableType);
          updateTimesheet(timesheetId, { billableType: newBillableType });
        }
      });
    } else {
      // Empty row - update calendar row metadata directly
      console.log('Updating empty calendar row metadata');
      updateCalendar(calendarRow.id, calendarRow.project, calendarRow.task, newBillableType);
    }
  };

  const handleHoursChange = (calendarRowId: string, date: Date, value: number) => {
    console.log('handleHoursChange:', { calendarRowId, date, value });
    
    // Find the calendar row - only process task rows
    const calendarRow = myCalendarViewData.find(row => row.id === calendarRowId);
    if (!calendarRow) return;

    // Search ALL timesheets for matching project+task+date (not just ones in calendar row)
    // This prevents duplicates when state hasn't updated yet
    const existingTimesheet = newTimesheets.find(ts => {
      const tsDate = new Date(ts.date);
      return ts.project === calendarRow.project && 
             ts.task === calendarRow.task && 
             ts.billableType === calendarRow.billableType &&
             tsDate.toDateString() === date.toDateString();
    });

    if (existingTimesheet) {
      // Update existing timesheet
      console.log('Updating existing timesheet:', existingTimesheet.id);
      updateTimesheet(existingTimesheet.id, { hours: value });
    } else if (value !== 0) {
      // Only create new timesheet if hours is not 00:00 (value is not 0)
      console.log('Creating new timesheet for date:', date.toDateString(), 'with hours:', value);
      const newTimesheet = {
        id: crypto.randomUUID(),
        date: date.toISOString(),
        project: calendarRow.project,
        task: calendarRow.task,
        description: '',
        hours: value,
        billableType: calendarRow.billableType,
        status: DailyTimesheetStatus.Default,
        isChecked: false,
      };
      addNewTimesheet(newTimesheet);
    } else {
      console.log('Skipping timesheet creation: hours is 0 (00:00)');
    }
  };

  const handleDescriptionChange = (calendarRowId: string, date: Date, value: string) => {
    console.log('handleDescriptionChange:', { calendarRowId, date: date.toDateString(), value, valueLength: value.length });
    
    // Find the calendar row
    const calendarRow = myCalendarViewData.find(row => row.id === calendarRowId);
    if (!calendarRow) {
      console.log('handleDescriptionChange - Calendar row not found:', calendarRowId);
      return;
    }

    // Search ALL timesheets for matching project+task+date (not just ones in calendar row)
    // This prevents duplicates when state hasn't updated yet
    const existingTimesheet = newTimesheets.find(ts => {
      const tsDate = new Date(ts.date);
      return ts.project === calendarRow.project && 
             ts.task === calendarRow.task && 
             ts.billableType === calendarRow.billableType &&
             tsDate.toDateString() === date.toDateString();
    });

    if (existingTimesheet) {
      // Update existing timesheet
      console.log('handleDescriptionChange - Updating existing timesheet description:', existingTimesheet.id, 'from', `"${existingTimesheet.description}"`, 'to', `"${value}"`);
      updateTimesheet(existingTimesheet.id, { description: value });
    } else {
      // Create new timesheet entry for this date
      console.log('handleDescriptionChange - Creating new timesheet for description on date:', date.toDateString());
      const newTimesheet = {
        id: crypto.randomUUID(),
        date: date.toISOString(),
        project: calendarRow.project,
        task: calendarRow.task,
        description: value,
        hours: 0,
        billableType: calendarRow.billableType,
        status: DailyTimesheetStatus.Default,
        isChecked: false,
      };
      addNewTimesheet(newTimesheet);
      console.log('handleDescriptionChange - Created new timesheet with ID:', newTimesheet.id);
    }
  };

  const getTimesheetForDate = (row: ITimesheetRow, date: Date) => {
    // Only get timesheet for task rows, not project rows
    if (row.isProjectRow || !row.project || !row.task) return undefined;
    
    // Search ALL timesheets for matching project+task+date
    const timesheet = newTimesheets.find(ts => {
      const tsDate = new Date(ts.date);
      return ts.project === row.project && 
             ts.task === row.task && 
             ts.billableType === row.billableType &&
             tsDate.toDateString() === date.toDateString();
    });
    
    if (timesheet) {
      console.log('getTimesheetForDate - Found timesheet:', timesheet.id, 'hours:', timesheet.hours, 'description:', timesheet.description);
    }
    
    return timesheet;
  };

  const columns: DataTableColumn<ITimesheetRow>[] = [
    {
      key: 'project-task',
      label: 'Project/Task',
      render: (row) => {
        if (row.isProjectRow) {
          return (
            <CustomRow 
              text={row.project || ''} 
            />
          );
        } else if (row.isCreateTaskRow) {
          return (
            <CreateTaskRow 
              onCreateTask={() => handleCreateTask(row.project || '')}
            />
          );
        } else {
          return (
            <TaskRow 
              task={row.task || ''} 
              billableType={row.billableType || BillableType.Billable} 
              rowId={row.id} 
              availableTasks={availableTasks} 
              onTaskChange={(rowId:any, task:any) => handleTaskChange(rowId, task)} 
              onBillableTypeChange={(rowId:any, type:any) => handleBillableTypeChange(rowId, type)} 
            />
          );
        }
      },
      width: '35%',
    },
    ...weekDays.map((day) => ({
        key: day.date.toDateString(),
        label: day.date.getDate().toString(),
        render: (row: ITimesheetRow) => {
          // Don't show timesheet cells for project rows or create task rows
          if (row.isProjectRow || row.isCreateTaskRow) {
            return null;
          }
          
          const timesheetForDate = getTimesheetForDate(row, day.date);
          return (
            <TimesheetCell 
              hours={timesheetForDate?.hours || 0} 
              description={timesheetForDate?.description || ''}
              isTodayColumn={day.date.toDateString() === new Date().toDateString()}
              onHoursChange={(value: number) => handleHoursChange(row.id, day.date, value)}
              onDescriptionChange={(value: string) => handleDescriptionChange(row.id, day.date, value)}
              date={day.date}
             row={row as unknown as Record<string, unknown>}
            />
          );
        },
        width: '9%',
      })),
    {
      key: 'actions',
      label: '',
      render: (row: ITimesheetRow) => {
        // Only show delete button for task rows (not project or create task rows)
        if (row.isProjectRow || row.isCreateTaskRow) {
          return null;
        }
        
        return (
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTask(row.id);
            }}
            sx={{ 
              color: '#666',
              '&:hover': {
                color: '#d32f2f',
                backgroundColor: 'rgba(211, 47, 47, 0.04)'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        );
      },
      width: '50px',
    }
  ];

  const handleRowClick = (row: ITimesheetRow) => {
    console.log('Clicked row:', row);
  };

  return (
    <DataTable
      columns={columns}
      rows={groupedData}
      getRowKey={(row) => row.id}
      onRowClick={handleRowClick}
    />
  );
};

export default MyTimesheetCalenderTable;
