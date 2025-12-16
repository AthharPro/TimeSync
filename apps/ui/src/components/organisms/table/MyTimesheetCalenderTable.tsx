import DataTable from '../../templates/other/DataTable';
import { DataTableColumn } from '../../../interfaces';
import { BillableType } from '@tms/shared';
import {
  IMyTimesheetCalendarEntry,
  ITimesheetRow,
  IMyTimesheetTableEntry,
} from '../../../interfaces/layout/ITableProps';
import { DailyTimesheetStatus } from '@tms/shared';
import TaskRow from './other/TaskRow';
import CreateTaskRow from './other/CreateTaskRow';
import TimesheetCell from './other/TimesheetCell';
import { useMyTimesheet } from '../../../hooks/timesheet/useMyTimesheet';
import { useMyProjects } from '../../../hooks/project/useMyProject';
import { useTasks } from '../../../hooks/task/useTasks';
import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomRow from './other/CustomRow';

interface ExtendedTimesheetRow extends ITimesheetRow {
  projectId?: string; // We'll add this for internal use
}

// Optimized debounced update that delays both Redux and backend updates
const createDebouncedUpdate = (
  updateFn: (id: string, updates: Partial<IMyTimesheetTableEntry>) => void,
  syncFn: (id: string, updates: Partial<IMyTimesheetTableEntry>) => Promise<void>,
  delay = 900
) => {
  const timers = new Map<string, NodeJS.Timeout>();
  
  return (id: string, updates: Partial<IMyTimesheetTableEntry>) => {
    // Clear existing timer for this ID
    if (timers.has(id)) {
      const timer = timers.get(id);
      if (timer) clearTimeout(timer);
    }
    
    // Debounce both Redux update and backend sync
    const timer = setTimeout(() => {
      // Update Redux state
      updateFn(id, updates);
      // Sync to backend
      syncFn(id, updates);
      timers.delete(id);
    }, delay);
    
    timers.set(id, timer);
  };
};

const MyTimesheetCalendarTable = () => {
  const {
    currentWeekDays,
    currentWeekStart,
    myCalendarViewData,
    newTimesheets,
    updateTimesheet,
    syncUpdateTimesheet,
    addNewTimesheet,
    updateCalendar,
    createEmptyCalendarRow,
    deleteCalendar,
    loadTimesheets,
  } = useMyTimesheet();

  const weekDays = currentWeekDays;
  
  // Create debounced update function (900ms delay)
  const debouncedUpdateRef = useRef(createDebouncedUpdate(updateTimesheet, syncUpdateTimesheet, 900));
  
  // Track if we've already loaded timesheets for the current week
  const loadedWeekRef = useRef<string>('');

  const { myProjects, loading: projectsLoading, error: projectsError, loadMyProjects } =
    useMyProjects();

  const { loadTasks, createTask } = useTasks();
  
  // Get all tasks from Redux store
  const tasksByProject = useSelector((state: RootState) => state.tasks.tasksByProject);
  const allTasks = useMemo(() => {
    return Object.values(tasksByProject).flat();
  }, [tasksByProject]);

  useEffect(() => {
    loadMyProjects();
  }, [loadMyProjects]);

  // Load timesheets for the current week (only once per week)
  useEffect(() => {
    const currentWeekStartStr = currentWeekStart.toISOString();
    
    if (currentWeekDays.length > 0 && currentWeekStartStr !== loadedWeekRef.current) {
      const startDate = currentWeekDays[0].date;
      const endDate = currentWeekDays[currentWeekDays.length - 1].date;
      
      console.log('MyTimesheetCalendarTable - Loading timesheets for week:', {
        startDate,
        endDate,
        currentWeekStart: currentWeekStartStr,
      });
      
      loadTimesheets(startDate, endDate);
      loadedWeekRef.current = currentWeekStartStr;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStart]); // Only depend on currentWeekStart to avoid infinite loop

  // Load tasks for all projects that appear in calendar view
  useEffect(() => {
    const projectIds = new Set<string>();
    myCalendarViewData.forEach((entry) => {
      const matchingProject = myProjects.find((p) => p.projectName === entry.project);
      if (matchingProject) {
        projectIds.add(matchingProject._id);
      }
    });
    
    projectIds.forEach(projectId => {
      loadTasks(projectId);
    });
  }, [myCalendarViewData, myProjects, loadTasks]);

  // Group by project._id
  const groupedData = useMemo<ExtendedTimesheetRow[]>(() => {
    // Map from project _id to project object for easy lookup
    const projectMap = new Map<string, { name: string; tasks: IMyTimesheetCalendarEntry[] }>();

    // Initialize all known projects
    myProjects.forEach((proj) => {
      projectMap.set(proj._id, { name: proj.projectName, tasks: [] });
    });

    // Populate tasks from calendar data
    myCalendarViewData.forEach((entry) => {
      // Find which project this entry belongs to by matching project ID or name
      const matchingProject = myProjects.find((p) => p._id === entry.project || p.projectName === entry.project);

      if (matchingProject) {
        const key = matchingProject._id;
        if (!projectMap.has(key)) {
          projectMap.set(key, { name: matchingProject.projectName, tasks: [] });
        }
        
        // Map task ID to task name for display
        const task = allTasks.find(t => t._id === entry.task);
        const taskName = task ? task.taskName : entry.task;
        
        projectMap.get(key)!.tasks.push({
          ...entry,
          project: matchingProject.projectName, // Use project name for display
          task: taskName, // Use task name for display
        });
      }
    });

    const rows: ExtendedTimesheetRow[] = [];

    projectMap.forEach((data, projectId) => {
      const projectName = data.name;

      // Project header row
      rows.push({
        id: `project-${projectId}`,
        project: projectName,
        projectId,
        isProjectRow: true,
      });

      // Task rows
      data.tasks.forEach((task) => {
        rows.push({
          id: task.id,
          project: task.project,
          projectId,
          task: task.task,
          billableType: task.billableType,
          myTimesheetEntriesIds: task.myTimesheetEntriesIds,
          isProjectRow: false,
        });
      });

      // Create task row
      rows.push({
        id: `create-task-${projectId}`,
        project: projectName,
        projectId,
        isProjectRow: false,
        isCreateTaskRow: true,
      });
    });

    return rows;
  }, [myCalendarViewData, myProjects, allTasks]);

  const handleCreateTask = (projectId: string) => {
    const project = myProjects.find((p) => p._id === projectId);
    if (!project) return;

    createEmptyCalendarRow(project.projectName, '', BillableType.Billable);
    // Note: createEmptyCalendarRow likely expects projectName, not _id
    // Adjust if your hook supports _id in the future
  };

  const handleDeleteTask = (rowId: string) => {
    deleteCalendar(rowId);
  };

  const handleTaskChange = async (calendarRowId: string, newTaskName: string | null) => {
    if (newTaskName === null) return;

    const calendarRow = myCalendarViewData.find((row) => row.id === calendarRowId);
    if (!calendarRow) return;

    // Find the project for this calendar row
    const matchingProject = myProjects.find((p) => p.projectName === calendarRow.project || p._id === calendarRow.project);
    if (!matchingProject) return;

    // Check if there's already a calendar row with the same project and task
    const duplicate = myCalendarViewData.find(row => 
      row.id !== calendarRowId && // Not the same row
      (row.project === calendarRow.project || row.project === matchingProject.projectName) && // Same project
      row.task === newTaskName // Same task
    );

    if (duplicate) {
      alert('A timesheet entry with this project and task already exists. Please use the existing entry or select a different task.');
      return;
    }

    // Get tasks for this project
    const projectTasks = tasksByProject[matchingProject._id] || [];
    
    // Find the task ID from task name
    const selectedTask = projectTasks.find(task => task.taskName === newTaskName);
    const taskId = selectedTask ? selectedTask._id : newTaskName;

    if (calendarRow.myTimesheetEntriesIds.length > 0) {
      calendarRow.myTimesheetEntriesIds.forEach((timesheetId) => {
        const timesheet = newTimesheets.find((t) => t.id === timesheetId);
        if (timesheet) {
          // Update UI with task name
          updateTimesheet(timesheetId, { task: newTaskName });
          // Sync task ID to backend
          if (selectedTask) {
            debouncedUpdateRef.current(timesheetId, { task: taskId });
          }
        }
      });
    } else {
      updateCalendar(calendarRow.id, calendarRow.project, newTaskName, calendarRow.billableType);
    }
  };

  const handleCreateNewTask = async (projectId: string, taskName: string) => {
    if (!taskName.trim()) return;

    try {
      console.log('Creating new task:', taskName, 'for project:', projectId);
      const newTask: any = await createTask({ projectId, taskName });
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const getAvailableTasksForProject = (projectId: string): string[] => {
    const projectTasks = tasksByProject[projectId] || [];
    return projectTasks.map(task => task.taskName);
  };

  const handleBillableTypeChange = (calendarRowId: string, newBillableType: BillableType) => {
    const calendarRow = myCalendarViewData.find((row) => row.id === calendarRowId);
    if (!calendarRow) return;

    if (calendarRow.myTimesheetEntriesIds.length > 0) {
      calendarRow.myTimesheetEntriesIds.forEach((timesheetId) => {
        const timesheet = newTimesheets.find((t) => t.id === timesheetId);
        if (timesheet) {
          updateTimesheet(timesheetId, { billableType: newBillableType });
        }
      });
    } else {
      updateCalendar(
        calendarRow.id,
        calendarRow.project,
        calendarRow.task ?? '',
        newBillableType
      );
    }
  };

  const handleHoursChange = (calendarRowId: string, date: Date, value: number) => {
    const calendarRow = myCalendarViewData.find((row) => row.id === calendarRowId);
    if (!calendarRow || !calendarRow.task) return;

    // Find the matching project to get project ID
    const matchingProject = myProjects.find((p) => p.projectName === calendarRow.project || p._id === calendarRow.project);
    if (!matchingProject) return;

    // Get the task ID (calendarRow.task might be either task ID or task name)
    const projectTasks = tasksByProject[matchingProject._id] || [];
    const taskObj = projectTasks.find(t => t.taskName === calendarRow.task || t._id === calendarRow.task);
    const taskId = taskObj ? taskObj._id : calendarRow.task;

    const existingTimesheet = newTimesheets.find((ts) => {
      const tsDate = new Date(ts.date);
      return (
        (ts.project === calendarRow.project || ts.project === matchingProject._id) &&
        ts.task === taskId &&
        ts.billableType === calendarRow.billableType &&
        tsDate.toDateString() === date.toDateString()
      );
    });

    if (existingTimesheet) {
      // Update with debounce (updates Redux immediately and syncs to backend after delay)
      debouncedUpdateRef.current(existingTimesheet.id, { hours: value });
    } else if (value !== 0) {
      addNewTimesheet({
        id: crypto.randomUUID(),
        date: date.toISOString(),
        project: calendarRow.project,
        task: taskId,
        description: '',
        hours: value,
        billableType: calendarRow.billableType,
        status: DailyTimesheetStatus.Default,
        isChecked: false,
      });
    }
  };

  const handleDescriptionChange = (calendarRowId: string, date: Date, value: string) => {
    const calendarRow = myCalendarViewData.find((row) => row.id === calendarRowId);
    if (!calendarRow || !calendarRow.task) return;

    // Find the matching project to get project ID
    const matchingProject = myProjects.find((p) => p.projectName === calendarRow.project || p._id === calendarRow.project);
    if (!matchingProject) return;

    // Get the task ID (calendarRow.task might be either task ID or task name)
    const projectTasks = tasksByProject[matchingProject._id] || [];
    const taskObj = projectTasks.find(t => t.taskName === calendarRow.task || t._id === calendarRow.task);
    const taskId = taskObj ? taskObj._id : calendarRow.task;

    const existingTimesheet = newTimesheets.find((ts) => {
      const tsDate = new Date(ts.date);
      return (
        (ts.project === calendarRow.project || ts.project === matchingProject._id) &&
        ts.task === taskId &&
        ts.billableType === calendarRow.billableType &&
        tsDate.toDateString() === date.toDateString()
      );
    });

    if (existingTimesheet) {
      // Update with debounce (updates Redux immediately and syncs to backend after delay)
      debouncedUpdateRef.current(existingTimesheet.id, { description: value });
    } else {
      addNewTimesheet({
        id: crypto.randomUUID(),
        date: date.toISOString(),
        project: calendarRow.project,
        task: taskId,
        description: value,
        hours: 0,
        billableType: calendarRow.billableType,
        status: DailyTimesheetStatus.Default,
        isChecked: false,
      });
    }
  };

  const getTimesheetForDate = (row: ExtendedTimesheetRow, date: Date) => {
    if (row.isProjectRow || row.isCreateTaskRow || !row.task || !row.billableType) {
      return undefined;
    }

    // Get the task ID from the task name (row.task is the display name)
    const projectTasks = row.projectId ? (tasksByProject[row.projectId] || []) : [];
    const taskObj = projectTasks.find(t => t.taskName === row.task);
    const taskId = taskObj ? taskObj._id : row.task;

    return newTimesheets.find((ts) => {
      const tsDate = new Date(ts.date);
      return (
        (ts.project === row.project || ts.project === row.projectId) &&
        ts.task === taskId &&
        ts.billableType === row.billableType &&
        tsDate.toDateString() === date.toDateString()
      );
    });
  };

  const columns: DataTableColumn<ExtendedTimesheetRow>[] = [
    {
      key: 'project-task',
      label: 'Project/Task',
      width: '35%',
      render: (row) => {
        if (row.isProjectRow) {
          return <CustomRow text={row.project || ''} />;
        }
        if (row.isCreateTaskRow) {
          return (
            <CreateTaskRow
              onCreateTask={() => row.projectId && handleCreateTask(row.projectId)}
            />
          );
        }
        
        const availableTasksForRow = row.projectId ? getAvailableTasksForProject(row.projectId) : [];
        
        return (
          <TaskRow
            task={row.task || ''}
            billableType={row.billableType ?? BillableType.Billable}
            rowId={row.id}
            projectId={row.projectId || ''}
            availableTasks={availableTasksForRow}
            onTaskChange={handleTaskChange}
            onBillableTypeChange={handleBillableTypeChange}
            onCreateNewTask={handleCreateNewTask}
          />
        );
      },
    },
    ...weekDays.map((day) => ({
      key: day.date.toDateString(),
      label: `${day.dayName}, ${day.monthName} ${day.dayNumber}`,
      width: '9%',
      render: (row: ExtendedTimesheetRow) => {
        if (row.isProjectRow || row.isCreateTaskRow) return null;

        const timesheet = getTimesheetForDate(row, day.date);

        return (
          <TimesheetCell
            hours={timesheet?.hours || 0}
            description={timesheet?.description || ''}
            isTodayColumn={day.date.toDateString() === new Date().toDateString()}
            onHoursChange={(value) => handleHoursChange(row.id, day.date, value)}
            onDescriptionChange={(value) =>
              handleDescriptionChange(row.id, day.date, value)
            }
            date={day.date}
            row={row}
          />
        );
      },
    })),
    {
      key: 'actions',
      label: '',
      width: '50px',
      render: (row: ExtendedTimesheetRow) => {
        if (row.isProjectRow || row.isCreateTaskRow) return null;

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
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        );
      },
    },
  ];

  if (projectsLoading) return <div>Loading projects...</div>;
  if (projectsError) return <div>Error loading projects</div>;

  return (
    <DataTable
      columns={columns}
      rows={groupedData}
      getRowKey={(row) => row.id}
    />
  );
};

export default MyTimesheetCalendarTable;