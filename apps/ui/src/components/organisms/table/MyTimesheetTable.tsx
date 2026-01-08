import { Checkbox, Box, CircularProgress, Alert } from '@mui/material';
import DataTable from '../../templates/other/DataTable';
import { DataTableColumn } from '../../../interfaces';
import { BillableType, DailyTimesheetStatus } from '@tms/shared';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useMyTimesheet } from '../../../hooks/timesheet/useMyTimesheet';
import { useMyProjects } from '../../../hooks/project/useMyProject';
import { useTasks } from '../../../hooks/task/useTasks';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import AutocompleteText from '../../atoms/other/inputField/Autocomplete';
import AutocompleteWithCreate from '../../atoms/other/inputField/AutocompleteWithCreate';
import DatePickerField from '../../atoms/other/inputField/DatePickerField';
import { BaseTextField } from '../../atoms';
import HoursField from '../../atoms/other/inputField/HoursField';
import Dropdown from '../../atoms/other/inputField/Dropdown';
import { ITimesheetTableEntry } from '../../../interfaces/component/organism/ITable';
import { IMyTimesheetTableEntry } from '../../../interfaces/layout/ITableProps';
import { TimesheetFilters } from '../popover/MyTimesheetFilterPopover';
import StatusChip from '../../atoms/other/Icon/StatusChip';

// Optimized debounced update that immediately updates Redux but debounces backend sync
const createDebouncedUpdate = (
  updateFn: (id: string, updates: Partial<IMyTimesheetTableEntry>) => void,
  syncFn: (id: string, updates: Partial<IMyTimesheetTableEntry>) => Promise<void>,
  delay = 900
) => {
  const timers = new Map<string, NodeJS.Timeout>();
  const pendingUpdates = new Map<string, Partial<IMyTimesheetTableEntry>>();
  
  const cancel = (id: string) => {
    // Cancel pending timer and clear updates for this ID
    if (timers.has(id)) {
      const timer = timers.get(id);
      if (timer) clearTimeout(timer);
      timers.delete(id);
    }
    pendingUpdates.delete(id);
  };
  
  const debouncedFn = (id: string, updates: Partial<IMyTimesheetTableEntry>) => {
    // Immediately update Redux state for responsive UI
    updateFn(id, updates);
    
    // Accumulate updates for this ID
    const existing = pendingUpdates.get(id) || {};
    const merged = { ...existing, ...updates };
    pendingUpdates.set(id, merged);
    
    // Clear existing timer for this ID
    if (timers.has(id)) {
      const timer = timers.get(id);
      if (timer) clearTimeout(timer);
    }
    
    // Debounce only the backend sync
    const timer = setTimeout(() => {
      const finalUpdates = pendingUpdates.get(id);
      if (finalUpdates) {
        // Sync accumulated updates to backend
        syncFn(id, finalUpdates);
        pendingUpdates.delete(id);
      }
      timers.delete(id);
    }, delay);
    
    timers.set(id, timer);
  };
  
  // Attach cancel method to the debounced function
  debouncedFn.cancel = cancel;
  
  return debouncedFn;
};

interface MyTimesheetTableProps {
  filters?: TimesheetFilters;
  isLoading?: boolean;
}

const MyTimesheetTable: React.FC<MyTimesheetTableProps> = ({ filters, isLoading = false }) => {
  const { newTimesheets, updateTimesheet, syncUpdateTimesheet, loadTimesheets } = useMyTimesheet();

  const { myProjects, myTeams, loading: projectsLoading, error: projectsError, loadMyProjects } =
    useMyProjects();

  const { loadTasks, createTask } = useTasks();
  
  // Get all tasks from Redux store
  const tasksByProject = useSelector((state: RootState) => state.tasks.tasksByProject);
  const allTasks = useMemo(() => {
    return Object.values(tasksByProject).flat();
  }, [tasksByProject]);

  const [openPickers, setOpenPickers] = useState<Set<string>>(new Set());
  const [selectedProjects, setSelectedProjects] = useState<Record<string, string>>({});
  
  // Track which projects we've already loaded tasks for
  const loadedProjectsRef = useRef<Set<string>>(new Set());

  // Create debounced update function (900ms delay)
  const debouncedUpdateRef = useRef(createDebouncedUpdate(updateTimesheet, syncUpdateTimesheet, 900));

  // Load projects on component mount
  useEffect(() => {
    loadMyProjects();
  }, [loadMyProjects]);

  // Load timesheets based on filters (for table view)
  useEffect(() => {
    // Only load if filters are provided (table view should always have filters)
    if (filters && filters.startDate && filters.endDate) {
      // Parse dates carefully to avoid timezone issues
      // When creating Date from YYYY-MM-DD string, it's interpreted as UTC midnight
      // We need to ensure we get the local date at midnight
      const [startYear, startMonth, startDay] = filters.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = filters.endDate.split('-').map(Number);
      
      // Create dates in local timezone
      const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
      
      loadTimesheets(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.startDate, filters?.endDate]); // Load when filter dates change

  // Initialize selectedProjects with project IDs from timesheets and load tasks
  useEffect(() => {
    const projectMap: Record<string, string> = {};
    
    newTimesheets.forEach((timesheet) => {
      // Get either project ID or team ID
      // If both project and team are present, prioritize team (timesheet is for a team member)
      const entityId = timesheet.team || timesheet.project;
      
      if (entityId && timesheet.id) {
        // Store the entity ID (project or team)
        projectMap[timesheet.id] = entityId;
        
        // Load tasks for this entity ID if not already loaded
        if (!loadedProjectsRef.current.has(entityId)) {
          loadTasks(entityId);
          loadedProjectsRef.current.add(entityId);
        }
      }
    });
    
    // Only update state if there are actual changes
    setSelectedProjects((prev) => {
      const prevKeys = Object.keys(prev);
      const newKeys = Object.keys(projectMap);
      
      if (prevKeys.length !== newKeys.length) {
        return projectMap;
      }
      
      for (const key of newKeys) {
        if (prev[key] !== projectMap[key]) {
          return projectMap;
        }
      }
      
      return prev; // No changes, return previous state
    });
   
  }, [newTimesheets]); // Only depend on newTimesheets

  const timesheetData: ITimesheetTableEntry[] = useMemo(() => {
    let filteredTimesheets = newTimesheets.map((timesheet) => {
     
      
      let projectName: string;
      if (timesheet.projectName) {
        // We have the name from backend - use it!
        projectName = timesheet.projectName;
      } else if (timesheet.teamName) {
        // We have the team name from backend - use it!
        projectName = timesheet.teamName;
      } else {
        // Try to look up in current assignments
        const project = timesheet.project ? myProjects.find(p => p._id === timesheet.project) : null;
        const team = timesheet.team ? myTeams.find(t => t._id === timesheet.team) : null;
        
        if (project) {
          projectName = project.projectName;
        } else if (team) {
          projectName = team.teamName;
        } else {
          // Don't show "[Deleted ...]" - just show empty string
          // This prevents the brief flash when loading or selecting projects
          projectName = '';
        }
      }
      
      // Use stored task name if available, otherwise look it up
      let taskName: string;
      if (timesheet.taskName) {
        taskName = timesheet.taskName;
      } else {
        const task = allTasks.find(t => t._id === timesheet.task);
        taskName = task ? task.taskName : '';
      }
      
      return {
        ...timesheet,
        date: new Date(timesheet.date),
        project: projectName, // Display project/team name instead of ID
        task: taskName, // Display task name instead of ID
      };
    });

    // Apply filters if provided
    if (filters) {
      filteredTimesheets = filteredTimesheets.filter((timesheet) => {
        // Filter by date range
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setHours(0, 0, 0, 0);
          // Normalize timesheet date to remove time component for accurate comparison
          const timesheetDate = new Date(timesheet.date);
          timesheetDate.setHours(0, 0, 0, 0);
          if (timesheetDate < startDate) return false;
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          // Normalize timesheet date to end of day for accurate comparison
          const timesheetDate = new Date(timesheet.date);
          timesheetDate.setHours(23, 59, 59, 999);
          if (timesheetDate > endDate) return false;
        }

        // Filter by status
        if (filters.status && filters.status !== 'All') {
          if (timesheet.status !== filters.status) return false;
        }

        // Filter by project or team based on filterBy setting
        if (filters.filterBy === 'project' && filters.projectId && filters.projectId !== 'All') {
          const originalTimesheet = newTimesheets.find(t => t.id === timesheet.id);
          if (originalTimesheet && originalTimesheet.project !== filters.projectId) return false;
        }

        if (filters.filterBy === 'team' && filters.teamId && filters.teamId !== 'All') {
          const originalTimesheet = newTimesheets.find(t => t.id === timesheet.id);
          if (originalTimesheet && originalTimesheet.team !== filters.teamId) return false;
        }

        return true;
      });
    }

    return filteredTimesheets;
  }, [newTimesheets, myProjects, myTeams, allTasks, filters]);

  // Helper function to check if a timesheet is editable (Draft or Rejected)
  const isTimesheetEditable = (status: string) => {
    return status === DailyTimesheetStatus.Draft || status === DailyTimesheetStatus.Rejected;
  };

  // Calculate selection state (only count Draft and Rejected timesheets)
  const editableTimesheets = timesheetData.filter((row) => isTimesheetEditable(row.status));
  const selectedEditableCount = editableTimesheets.filter((row) => row.isChecked).length;
  const isAllSelected = editableTimesheets.length > 0 && selectedEditableCount === editableTimesheets.length;
  const isIndeterminate = selectedEditableCount > 0 && selectedEditableCount < editableTimesheets.length;

  // Extract project and team names from backend data
  const availableProjectNames = useMemo<string[]>(() => {
    const projectNames = myProjects.map((proj) => proj.projectName);
    const teamNames = myTeams.map((team) => team.teamName);
    return [...projectNames, ...teamNames];
  }, [myProjects, myTeams]);

  // Get available task names for the currently selected project in each row
  const getAvailableTasksForRow = (rowId: string): string[] => {
    const projectId = selectedProjects[rowId];
    if (!projectId) return [];
    const projectTasks = tasksByProject[projectId] || [];
    return projectTasks.map(task => task.taskName);
  };

  const handleCheckboxChange = (id: string) => {
    const currentRow = timesheetData.find((row) => row.id === id);
    if (currentRow) {
      updateTimesheet(id, { isChecked: !currentRow.isChecked });
    }
  };

  const handleSelectAll = () => {
    const newCheckedState = !isAllSelected;
    // Only select/deselect Draft and Rejected timesheets
    timesheetData.forEach((row) => {
      if (isTimesheetEditable(row.status)) {
        updateTimesheet(row.id, { isChecked: newCheckedState });
      }
    });
  };

  const handleProjectChange = async (id: string, newProjectName: string | null | undefined) => {
    if (newProjectName !== null && newProjectName !== undefined) {
      // Cancel any pending debounced updates for this row to prevent stale data from being sent
      debouncedUpdateRef.current.cancel(id);
      
      // Find the project ID from the project name
      const selectedProject = myProjects.find(proj => proj.projectName === newProjectName);
      // If not a project, check if it's a team
      const selectedTeam = !selectedProject ? myTeams.find(team => team.teamName === newProjectName) : null;
      
      if (selectedProject) {
        // Immediately update UI with project name and clear task
        // Use projectName for display, and project for the ID
        updateTimesheet(id, { 
          project: selectedProject._id,  // Store ID in project field
          projectName: newProjectName,    // Store name in projectName field for display
          task: '',                       // Clear task ID
          taskName: ''                    // Clear task name
        });
        
        // Load tasks for this project BEFORE updating selectedProjects
        // This ensures tasks are available when the component re-renders
        await loadTasks(selectedProject._id);
        loadedProjectsRef.current.add(selectedProject._id);
        
        // Now update the selected project ID for this row
        setSelectedProjects(prev => ({ ...prev, [id]: selectedProject._id }));
        
        // Immediately sync to backend to update project and clear task
        try {
          await syncUpdateTimesheet(id, { project: selectedProject._id, task: '' });
        } catch (error) {
          // Sync failed
        }
      } else if (selectedTeam) {
        
        updateTimesheet(id, { 
          team: selectedTeam._id,      // Store ID in team field
          teamName: newProjectName,    // Store name in teamName field for display
          task: '',                    // Clear task ID
          taskName: ''                 // Clear task name
        });
        
        
        await loadTasks(selectedTeam._id);
        loadedProjectsRef.current.add(selectedTeam._id);
        
        // Now update the selected team ID for this row
        setSelectedProjects(prev => ({ ...prev, [id]: selectedTeam._id }));
        
        // Immediately sync to backend to update team and clear task
        try {
          await syncUpdateTimesheet(id, { team: selectedTeam._id, task: '' });
        } catch (error) {
          // Sync failed
        }
      }
    }
  };

  const handleTaskChange = async (id: string, newTaskName: string | null) => {
    if (newTaskName !== null) {
      // Get the project ID for this row
      const projectId = selectedProjects[id];
      const projectTasks = projectId ? tasksByProject[projectId] || [] : [];
      
      // Find the task ID from task name in the current project's tasks
      const selectedTask = projectTasks.find(task => task.taskName === newTaskName);
      
      if (selectedTask) {
        // Update UI with task name and immediately sync to backend with task ID
        updateTimesheet(id, { task: newTaskName });
        try {
          await syncUpdateTimesheet(id, { task: selectedTask._id });
        } catch (error) {
          // Sync failed
        }
      } else {
        // If task not found, just update UI (will be created separately)
        updateTimesheet(id, { task: newTaskName });
      }
    }
  };

  const handleCreateNewTask = async (rowId: string, taskName: string) => {
    const projectId = selectedProjects[rowId];
    if (!projectId) {
      return;
    }

    try {
      const newTask: any = await createTask({ projectId, taskName });
      
      // Immediately sync to backend with new task ID (no debounce)
      if (newTask && newTask._id) {
        await syncUpdateTimesheet(rowId, { task: newTask._id });
      }
    } catch (error) {
      // Task creation failed
    }
  };

  const handleDescriptionChange = (id: string, newDescription: string) => {
    debouncedUpdateRef.current(id, { description: newDescription });
  };

  const handleHoursChange = (id: string, newHours: number) => {
    debouncedUpdateRef.current(id, { hours: newHours });
  };

  const handleBillableTypeChange = (id: string, newBillableType: BillableType) => {
    debouncedUpdateRef.current(id, { billableType: newBillableType });
  };

  const handleDateChange = (id: string, newDate: Date | null) => {
    if (newDate !== null) {
      debouncedUpdateRef.current(id, { date: newDate.toISOString() });
    }
  };

  const columns: DataTableColumn<ITimesheetTableEntry>[] = [
    {
      key: 'checkbox',
      label: '',
      renderHeader: () => (
        <Checkbox
          size="small"
          sx={{ paddingTop: 0, paddingBottom: 0 }}
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleSelectAll}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      render: (row) => (
        <Checkbox
          size="small"
          checked={row.isChecked || false}
          onChange={() => handleCheckboxChange(row.id)}
          onClick={(e) => e.stopPropagation()}
          disabled={!isTimesheetEditable(row.status)}
        />
      ),
      width: '2%',
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <DatePickerField
          value={row.date}
          onChange={(newDate) => handleDateChange(row.id, newDate)}
          open={openPickers.has(row.id)}
          onOpen={() => setOpenPickers(new Set([row.id]))}
          onClose={() =>
            setOpenPickers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(row.id);
              return newSet;
            })
          }
          onClick={() => setOpenPickers(new Set([row.id]))}
          disabled={!isTimesheetEditable(row.status)}
        />
      ),
      width: '6%',
    },
    {
      key: 'project',
      label: 'Project',
      render: (row) => (
        <AutocompleteText
          value={row.project}
          placeholder="Select or enter project"
          onChange={(event, newValue) => handleProjectChange(row.id, newValue)}
          options={availableProjectNames}
          disabled={!isTimesheetEditable(row.status)}
        />
      ),
      width: '18%',
    },
    {
      key: 'task',
      label: 'Task',
      render: (row) => (
        <AutocompleteWithCreate
          value={row.task}
          placeholder="Select or enter task"
          onChange={(event, newValue) => handleTaskChange(row.id, newValue)}
          options={getAvailableTasksForRow(row.id)}
          onCreateNew={async (taskName) => await handleCreateNewTask(row.id, taskName)}
          disabled={!selectedProjects[row.id] || !isTimesheetEditable(row.status)}
        />
      ),
      width: '30%',
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <BaseTextField
          key={`description-${row.id}`}
          defaultValue={row.description}
          placeholder="Enter description"
          onChange={(e) => handleDescriptionChange(row.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          variant="standard"
          disabled={!isTimesheetEditable(row.status)}
          sx={{
            width: '100%',
            '& .MuiInput-underline:before': { borderBottom: 'none' },
            '& .MuiInput-underline:after': { borderBottom: 'none' },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              borderBottom: 'none',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
              color: 'rgba(0, 0, 0, 0.87)',
            },
          }}
        />
      ),
      width: '25%',
    },
    {
      key: 'hours',
      label: 'Hours',
      render: (row) => (
        <HoursField
          value={row.hours}
          onChange={(newHours) => handleHoursChange(row.id, newHours)}
          onClick={(e) => e.stopPropagation()}
          disabled={!isTimesheetEditable(row.status)}
        />
      ),
      width: '7%',
    },
    {
      key: 'billableType',
      label: 'Billable',
      render: (row) => (
        <Dropdown
          value={row.billableType}
          onChange={(newBillableType) =>
            handleBillableTypeChange(row.id, newBillableType)
          }
          options={BillableType}
          onClick={(e) => e.stopPropagation()}
          disabled={!isTimesheetEditable(row.status)}
        />
      ),
      width: '10%',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} />,
      width: '5%',
    },
  ];

  const handleRowClick = (row: ITimesheetTableEntry) => {
    // Handle row click
  };

  // Loading / Error states
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
        <Alert severity="error">Error loading projects: {projectsError}</Alert>
      </Box>
    );
  }

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

  return (
    <DataTable
      columns={columns}
      rows={timesheetData}
      getRowKey={(row) => row.id}
      onRowClick={handleRowClick}
    />
  );
};

export default MyTimesheetTable;