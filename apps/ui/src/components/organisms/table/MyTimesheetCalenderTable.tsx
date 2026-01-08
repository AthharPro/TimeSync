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
import { IconButton, Box, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomRow from './other/CustomRow';

interface ExtendedTimesheetRow extends ITimesheetRow {
  projectId?: string; // For projects
  teamId?: string;    // For teams
  isRemovedEntry?: boolean; // Flag to indicate this entry is from a removed project/team
}

interface MyTimesheetCalendarTableProps {
  onError?: (message: string) => void;
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

const MyTimesheetCalendarTable: React.FC<MyTimesheetCalendarTableProps> = ({ onError }) => {
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
    isLoading,
  } = useMyTimesheet();

  const weekDays = currentWeekDays;
  
  // Create debounced update function (900ms delay)
  const debouncedUpdateRef = useRef(createDebouncedUpdate(updateTimesheet, syncUpdateTimesheet, 900));
  
  // Track if we've already loaded timesheets for the current week
  const loadedWeekRef = useRef<string>('');

  const { myProjects, myTeams, loading: projectsLoading, error: projectsError, loadMyProjects } =
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
  
  // Debug: Log when projects and teams are loaded
  useEffect(() => {
    console.log('MyTimesheetCalendarTable - Projects loaded:', myProjects);
    console.log('MyTimesheetCalendarTable - Teams loaded:', myTeams);
  }, [myProjects, myTeams]);

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

  // Load tasks for all projects and teams that appear in calendar view
  useEffect(() => {
    const entityIds = new Set<string>();
    myCalendarViewData.forEach((entry) => {
      const matchingProject = entry.project ? myProjects.find((p) => p.projectName === entry.project || p._id === entry.project) : null;
      const matchingTeam = entry.team ? myTeams.find((t) => t.teamName === entry.team || t._id === entry.team) : null;
      
      if (matchingProject) {
        entityIds.add(matchingProject._id);
      } else if (matchingTeam) {
        entityIds.add(matchingTeam._id);
      }
    });
    
    entityIds.forEach(entityId => {
      loadTasks(entityId);
    });
  }, [myCalendarViewData, myProjects, myTeams, loadTasks]);

  // Group by project._id
  const groupedData = useMemo<ExtendedTimesheetRow[]>(() => {
    // Separate private and public projects
    const privateProjects = myProjects.filter(proj => !proj.isPublic);
    const publicProjects = myProjects.filter(proj => proj.isPublic);
    
    // Map from project _id to project object for easy lookup
    const projectMap = new Map<string, { name: string; tasks: IMyTimesheetCalendarEntry[]; isPublic: boolean; isTeam?: boolean }>();

    // Initialize all known projects (private first, then public)
    [...privateProjects, ...publicProjects].forEach((proj) => {
      projectMap.set(proj._id, { name: proj.projectName, tasks: [], isPublic: proj.isPublic || false, isTeam: false });
    });
    
    // Initialize all known teams (they will appear after public projects)
    myTeams.forEach((team) => {
      projectMap.set(team._id, { name: team.teamName, tasks: [], isPublic: false, isTeam: true });
    });

    // Track removed projects/teams - entries where user no longer has access but project/team still exists in DB
    const removedEntries: IMyTimesheetCalendarEntry[] = [];

    // Populate tasks from calendar data
    myCalendarViewData.forEach((entry) => {
      // Priority 1: Use the stored names from backend (works even if user removed from project/team)
      // Priority 2: Match by ID in current projects/teams
      
      const matchingProject = entry.project ? myProjects.find((p) => p._id === entry.project) : null;
      const matchingTeam = entry.team ? myTeams.find((t) => t._id === entry.team) : null;

      if (matchingProject) {
        // User still has access to this project
        const key = matchingProject._id;
        if (!projectMap.has(key)) {
          projectMap.set(key, { name: matchingProject.projectName, tasks: [], isPublic: matchingProject.isPublic || false, isTeam: false });
        }
        
        // Use stored task name if available, otherwise look it up
        const taskName = entry.taskName || (allTasks.find(t => t._id === entry.task)?.taskName) || entry.task;
        
        projectMap.get(key)!.tasks.push({
          ...entry,
          project: matchingProject.projectName, // Use project name
          task: taskName, // Use task name
        });
      } else if (matchingTeam) {
        // User still has access to this team
        const key = matchingTeam._id;
        if (!projectMap.has(key)) {
          projectMap.set(key, { name: matchingTeam.teamName, tasks: [], isPublic: false, isTeam: true });
        }
        
        // Use stored task name if available, otherwise look it up
        const taskName = entry.taskName || (allTasks.find(t => t._id === entry.task)?.taskName) || entry.task;
        
        projectMap.get(key)!.tasks.push({
          ...entry,
          project: matchingTeam.teamName, // Use team name
          task: taskName, // Use task name
        });
      } else if (entry.project || entry.team) {
        // User no longer has access, but we have the names from backend
        // Create entry for this removed project/team using stored names
        const key = entry.project || entry.team || 'unknown';
        const storedName = entry.projectName || entry.teamName;
        
        if (storedName) {
          // We have the actual name from backend - use it!
          if (!projectMap.has(key)) {
            projectMap.set(key, { 
              name: storedName, 
              tasks: [], 
              isPublic: false, 
              isTeam: !!entry.team 
            });
          }
          
          const taskName = entry.taskName || entry.task;
          
          projectMap.get(key)!.tasks.push({
            ...entry,
            project: storedName,
            task: taskName,
          });
        } else {
          // Fallback: No name available (shouldn't happen with new backend)
          removedEntries.push(entry);
        }
      }
    });

    const rows: ExtendedTimesheetRow[] = [];

    // 1. Process private projects first
    privateProjects.forEach((proj) => {
      const data = projectMap.get(proj._id);
      if (!data) return;
      
      const projectName = data.name;

      // Project header row
      rows.push({
        id: `project-${proj._id}`,
        project: projectName,
        projectId: proj._id,
        isProjectRow: true,
      });

      // Task rows
      data.tasks.forEach((task) => {
        rows.push({
          id: task.id,
          project: task.project,
          projectId: proj._id,
          task: task.task,
          billableType: task.billableType,
          myTimesheetEntriesIds: task.myTimesheetEntriesIds,
          isProjectRow: false,
        });
      });

      // Create task row
      rows.push({
        id: `create-task-${proj._id}`,
        project: projectName,
        projectId: proj._id,
        isProjectRow: false,
        isCreateTaskRow: true,
      });
    });
    
    // 2. Process teams second
    myTeams.forEach((team) => {
      const data = projectMap.get(team._id);
      if (!data) return;
      
      const teamName = data.name;

      // Team header row (similar to project header)
      rows.push({
        id: `team-${team._id}`,
        project: teamName,
        teamId: team._id,
        isProjectRow: true,
      });

      // Task rows for team
      data.tasks.forEach((task) => {
        rows.push({
          id: task.id,
          project: task.project,
          teamId: team._id,
          task: task.task,
          billableType: task.billableType,
          myTimesheetEntriesIds: task.myTimesheetEntriesIds,
          isProjectRow: false,
        });
      });

      // Create task row for team
      rows.push({
        id: `create-task-${team._id}`,
        project: teamName,
        teamId: team._id,
        isProjectRow: false,
        isCreateTaskRow: true,
      });
    });

    // 3. Process public projects last
    publicProjects.forEach((proj) => {
      const data = projectMap.get(proj._id);
      if (!data) return;
      
      const projectName = data.name;

      // Project header row
      rows.push({
        id: `project-${proj._id}`,
        project: projectName,
        projectId: proj._id,
        isProjectRow: true,
      });

      // Task rows
      data.tasks.forEach((task) => {
        rows.push({
          id: task.id,
          project: task.project,
          projectId: proj._id,
          task: task.task,
          billableType: task.billableType,
          myTimesheetEntriesIds: task.myTimesheetEntriesIds,
          isProjectRow: false,
        });
      });

      // Create task row
      rows.push({
        id: `create-task-${proj._id}`,
        project: projectName,
        projectId: proj._id,
        isProjectRow: false,
        isCreateTaskRow: true,
      });
    });

    // 4. Process removed projects/teams entries last (fallback for entries without stored names)
    // Group removed entries by project/team ID
    if (removedEntries.length > 0) {
      const removedMap = new Map<string, IMyTimesheetCalendarEntry[]>();
      
      removedEntries.forEach((entry) => {
        const key = entry.project || entry.team || 'unknown';
        if (!removedMap.has(key)) {
          removedMap.set(key, []);
        }
        removedMap.get(key)!.push(entry);
      });

      // Add a section for each removed project/team
      removedMap.forEach((entries, projectOrTeamId) => {
        // Determine if this is a project or team based on the first entry
        const firstEntry = entries[0];
        const isTeam = !!firstEntry.team;
        // Use stored name if available, otherwise show as [Deleted]
        const displayName = firstEntry.projectName || firstEntry.teamName || `[Deleted ${isTeam ? 'Team' : 'Project'}]`;

        // Header row for removed project/team
        rows.push({
          id: `removed-${projectOrTeamId}`,
          project: displayName,
          projectId: isTeam ? undefined : projectOrTeamId,
          teamId: isTeam ? projectOrTeamId : undefined,
          isProjectRow: true,
        });

        // Add task rows for this removed project/team
        entries.forEach((entry) => {
          const taskName = entry.taskName || entry.task;

          rows.push({
            id: entry.id,
            project: displayName,
            projectId: isTeam ? undefined : projectOrTeamId,
            teamId: isTeam ? projectOrTeamId : undefined,
            task: taskName,
            billableType: entry.billableType,
            myTimesheetEntriesIds: entry.myTimesheetEntriesIds,
            isProjectRow: false,
            isRemovedEntry: true, // Flag to indicate this is a removed entry
          });
        });
      });
    }

    return rows;
  }, [myCalendarViewData, myProjects, myTeams, allTasks]);

  const handleCreateTask = (projectId: string) => {
    const project = myProjects.find((p) => p._id === projectId);
    const team = !project ? myTeams.find((t) => t._id === projectId) : null;
    
    if (project) {
      // Use project ID instead of name to match timesheet creation
      createEmptyCalendarRow(project._id, undefined, '', BillableType.NonBillable);
    } else if (team) {
      // Use team ID instead of name to match timesheet creation  
      createEmptyCalendarRow(undefined, team._id, '', BillableType.NonBillable);
    }
  };

  const handleDeleteTask = (rowId: string) => {
    deleteCalendar(rowId);
  };

  const handleTaskChange = async (calendarRowId: string, newTaskName: string | null) => {
    if (newTaskName === null) return;

    const calendarRow = myCalendarViewData.find((row) => row.id === calendarRowId);
    if (!calendarRow) return;

    // Find the project or team for this calendar row
    const matchingProject = calendarRow.project ? myProjects.find((p) => p.projectName === calendarRow.project || p._id === calendarRow.project) : null;
    const matchingTeam = calendarRow.team ? myTeams.find((t) => t.teamName === calendarRow.team || t._id === calendarRow.team) : null;
    
    if (!matchingProject && !matchingTeam) return;

    // Check if there's already a calendar row with the same project/team and task
    const duplicate = myCalendarViewData.find(row => 
      row.id !== calendarRowId && // Not the same row
      ((row.project && row.project === calendarRow.project) || 
       (row.team && row.team === calendarRow.team) ||
       (matchingProject && row.project === matchingProject.projectName) ||
       (matchingTeam && row.team === matchingTeam.teamName)) && // Same project/team
      row.task === newTaskName // Same task
    );

    if (duplicate) {
      alert('A timesheet entry with this project and task already exists. Please use the existing entry or select a different task.');
      return;
    }

    // Get tasks for this project or team
    const entityId = matchingProject ? matchingProject._id : matchingTeam!._id;
    const projectTasks = tasksByProject[entityId] || [];
    
    // Find the task ID from task name
    const selectedTask = projectTasks.find(task => task.taskName === newTaskName);
    const taskId = selectedTask ? selectedTask._id : newTaskName;

    if (calendarRow.myTimesheetEntriesIds.length > 0) {
      calendarRow.myTimesheetEntriesIds.forEach((timesheetId) => {
        const timesheet = newTimesheets.find((t) => t.id === timesheetId);
        if (timesheet) {
          // Update UI with task ID (not name) to match backend
          updateTimesheet(timesheetId, { task: taskId });
          // Sync task ID to backend
          if (selectedTask) {
            debouncedUpdateRef.current(timesheetId, { task: taskId });
          }
        }
      });
    } else {
      // Update calendar row with task ID (not name) to match timesheet creation
      updateCalendar(calendarRow.id, calendarRow.project, calendarRow.team, taskId, calendarRow.billableType);
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
          // Update Redux state immediately
          updateTimesheet(timesheetId, { billableType: newBillableType });
          // Sync to backend
          syncUpdateTimesheet(timesheetId, { billableType: newBillableType });
        }
      });
    } else {
      updateCalendar(
        calendarRow.id,
        calendarRow.project,
        calendarRow.team,
        calendarRow.task ?? '',
        newBillableType
      );
    }
  };

  const handleHoursChange = async (calendarRowId: string, date: Date, value: number) => {
    const calendarRow = myCalendarViewData.find((row) => row.id === calendarRowId);
    if (!calendarRow || !calendarRow.task) return;

    // Find the matching project or team to get ID
    const matchingProject = calendarRow.project ? myProjects.find((p) => p.projectName === calendarRow.project || p._id === calendarRow.project) : null;
    const matchingTeam = calendarRow.team ? myTeams.find((t) => t.teamName === calendarRow.team || t._id === calendarRow.team) : null;
    
    if (!matchingProject && !matchingTeam) return;

    // Get the task ID (calendarRow.task might be either task ID or task name)
    const entityId = matchingProject ? matchingProject._id : matchingTeam!._id;
    const projectTasks = tasksByProject[entityId] || [];
    const taskObj = projectTasks.find(t => t.taskName === calendarRow.task || t._id === calendarRow.task);
    const taskId = taskObj ? taskObj._id : calendarRow.task;

    const existingTimesheet = newTimesheets.find((ts) => {
      const tsDate = new Date(ts.date);
      const entityMatch = matchingProject 
        ? (ts.project === calendarRow.project || ts.project === entityId)
        : (ts.team === calendarRow.team || ts.team === entityId);
      
      return (
        entityMatch &&
        ts.task === taskId &&
        ts.billableType === calendarRow.billableType &&
        tsDate.toDateString() === date.toDateString()
      );
    });

    if (existingTimesheet) {
      // Update with debounce (updates Redux immediately and syncs to backend after delay)
      debouncedUpdateRef.current(existingTimesheet.id, { hours: value });
    } else if (value !== 0) {
      try {
        await addNewTimesheet({
          id: crypto.randomUUID(),
          date: date.toISOString(),
          project: matchingProject ? matchingProject._id : undefined,
          team: matchingTeam ? matchingTeam._id : undefined,
          task: taskId,
          description: '',
          hours: value,
          billableType: calendarRow.billableType,
          status: DailyTimesheetStatus.Default,
          isChecked: false,
        });
      } catch (error: any) {
        console.error('Failed to create timesheet:', error.message);
        // Show error toast message
        if (onError) {
          onError(error.message || 'Failed to create timesheet');
        }
      }
    }
  };

  const handleDescriptionChange = async (calendarRowId: string, date: Date, value: string) => {
    const calendarRow = myCalendarViewData.find((row) => row.id === calendarRowId);
    if (!calendarRow || !calendarRow.task) return;

    // Find the matching project or team to get ID
    const matchingProject = calendarRow.project ? myProjects.find((p) => p.projectName === calendarRow.project || p._id === calendarRow.project) : null;
    const matchingTeam = calendarRow.team ? myTeams.find((t) => t.teamName === calendarRow.team || t._id === calendarRow.team) : null;
    
    if (!matchingProject && !matchingTeam) return;

    // Get the task ID (calendarRow.task might be either task ID or task name)
    const entityId = matchingProject ? matchingProject._id : matchingTeam!._id;
    const projectTasks = tasksByProject[entityId] || [];
    const taskObj = projectTasks.find(t => t.taskName === calendarRow.task || t._id === calendarRow.task);
    const taskId = taskObj ? taskObj._id : calendarRow.task;

    const existingTimesheet = newTimesheets.find((ts) => {
      const tsDate = new Date(ts.date);
      const entityMatch = matchingProject 
        ? (ts.project === calendarRow.project || ts.project === entityId)
        : (ts.team === calendarRow.team || ts.team === entityId);
      
      return (
        entityMatch &&
        ts.task === taskId &&
        ts.billableType === calendarRow.billableType &&
        tsDate.toDateString() === date.toDateString()
      );
    });

    if (existingTimesheet) {
      // Update with debounce (updates Redux immediately and syncs to backend after delay)
      debouncedUpdateRef.current(existingTimesheet.id, { description: value });
    } else {
      try {
        await addNewTimesheet({
          id: crypto.randomUUID(),
          date: date.toISOString(),
          project: matchingProject ? matchingProject._id : undefined,
          team: matchingTeam ? matchingTeam._id : undefined,
          task: taskId,
          description: value,
          hours: 0,
          billableType: calendarRow.billableType,
          status: DailyTimesheetStatus.Default,
          isChecked: false,
        });
      } catch (error: any) {
        console.error('Failed to create timesheet:', error.message);
        // Show error toast message
        if (onError) {
          onError(error.message || 'Failed to create timesheet');
        }
      }
    }
  };

  const getTimesheetForDate = (row: ExtendedTimesheetRow, date: Date) => {
    if (row.isProjectRow || row.isCreateTaskRow || !row.task || !row.billableType) {
      return undefined;
    }

    // Get the task ID from the task name (row.task is the display name)
    const entityId = row.projectId || row.teamId;
    const projectTasks = entityId ? (tasksByProject[entityId] || []) : [];
    const taskObj = projectTasks.find(t => t.taskName === row.task);
    const taskId = taskObj ? taskObj._id : row.task;

    return newTimesheets.find((ts) => {
      const tsDate = new Date(ts.date);
      
      // Match based on whether this row is a project or team
      const entityMatch = row.projectId 
        ? (ts.project === row.project || ts.project === row.projectId)
        : (ts.team === row.teamId);
      
      return (
        entityMatch &&
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
          const entityId = row.projectId || row.teamId;
          return (
            <CreateTaskRow
              onCreateTask={() => entityId && handleCreateTask(entityId)}
            />
          );
        }
        
        const entityId = row.projectId || row.teamId;
        const availableTasksForRow = entityId ? getAvailableTasksForProject(entityId) : [];
        
        return (
          <TaskRow
            task={row.task || ''}
            billableType={row.billableType ?? BillableType.NonBillable}
            rowId={row.id}
            projectId={entityId || ''}
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
        // Only allow editing for Draft timesheets AND not removed entries
        const isDraft = !timesheet?.status || timesheet.status === DailyTimesheetStatus.Draft;
        const isEditable = isDraft && !row.isRemovedEntry;

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
            disabled={!isEditable}
            status={timesheet?.status}
          />
        );
      },
    })),
  ];

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (projectsLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (projectsError) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <Alert severity="error">Error loading projects</Alert>
      </Box>
    );
  }

  return (
    <DataTable
      columns={columns}
      rows={groupedData}
      getRowKey={(row) => row.id}
    />
  );
};

export default MyTimesheetCalendarTable;