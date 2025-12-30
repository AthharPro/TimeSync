import { Checkbox } from '@mui/material';
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

interface MyTimesheetTableProps {
  filters?: TimesheetFilters;
}

const MyTimesheetTable: React.FC<MyTimesheetTableProps> = ({ filters }) => {
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
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      console.log('MyTimesheetTable - Loading timesheets for filtered date range:', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      
      loadTimesheets(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.startDate, filters?.endDate]); // Load when filter dates change

  // Initialize selectedProjects with project IDs from timesheets and load tasks
  useEffect(() => {
    const projectMap: Record<string, string> = {};
    
    newTimesheets.forEach((timesheet) => {
      if (timesheet.project && timesheet.id) {
        // Store the project ID (timesheet.project contains the ID)
        projectMap[timesheet.id] = timesheet.project;
        
        // Load tasks for this project ID if not already loaded
        if (!loadedProjectsRef.current.has(timesheet.project)) {
          loadTasks(timesheet.project);
          loadedProjectsRef.current.add(timesheet.project);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTimesheets]); // Only depend on newTimesheets

  const timesheetData: ITimesheetTableEntry[] = useMemo(() => {
    let filteredTimesheets = newTimesheets.map((timesheet) => {
      // Find project name from project ID
      const project = myProjects.find(p => p._id === timesheet.project);
      // If not a project, check if it's a team
      const team = !project ? myTeams.find(t => t._id === timesheet.project) : null;
      const projectName = project ? project.projectName : (team ? team.teamName : timesheet.project);
      
      // Find task name from task ID (search in all tasks from all projects)
      const task = allTasks.find(t => t._id === timesheet.task);
      const taskName = task ? task.taskName : timesheet.task;
      
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
          if (timesheet.date < startDate) return false;
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (timesheet.date > endDate) return false;
        }

        // Filter by status
        if (filters.status && filters.status !== 'All') {
          if (timesheet.status !== filters.status) return false;
        }

        // Filter by project (comparing with original project ID from newTimesheets)
        if (filters.project && filters.project !== 'All') {
          const originalTimesheet = newTimesheets.find(t => t.id === timesheet.id);
          if (originalTimesheet && originalTimesheet.project !== filters.project) return false;
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
    console.log('MyTimesheetTable - Available projects:', projectNames);
    console.log('MyTimesheetTable - Available teams:', teamNames);
    console.log('MyTimesheetTable - Combined list:', [...projectNames, ...teamNames]);
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

  const handleProjectChange = (id: string, newProjectName: string | null) => {
    if (newProjectName !== null) {
      // Find the project ID from the project name
      const selectedProject = myProjects.find(proj => proj.projectName === newProjectName);
      // If not a project, check if it's a team
      const selectedTeam = !selectedProject ? myTeams.find(team => team.teamName === newProjectName) : null;
      
      if (selectedProject) {
        // Store the selected project ID for this row
        setSelectedProjects(prev => ({ ...prev, [id]: selectedProject._id }));
        
        // Load tasks for this project
        loadTasks(selectedProject._id);
        
        // Update UI with project name and sync to backend with project ID
        updateTimesheet(id, { project: newProjectName });
        debouncedUpdateRef.current(id, { project: selectedProject._id });
      } else if (selectedTeam) {
        // Store the selected team ID for this row
        setSelectedProjects(prev => ({ ...prev, [id]: selectedTeam._id }));
        
        // Load tasks for this team
        loadTasks(selectedTeam._id);
        
        // Update UI with team name and sync to backend with team ID
        updateTimesheet(id, { project: newProjectName });
        debouncedUpdateRef.current(id, { project: selectedTeam._id });
      } else {
        console.warn('Project or team not found for name:', newProjectName);
      }
    }
  };

  const handleTaskChange = (id: string, newTaskName: string | null) => {
    if (newTaskName !== null) {
      // Get the project ID for this row
      const projectId = selectedProjects[id];
      const projectTasks = projectId ? tasksByProject[projectId] || [] : [];
      
      // Find the task ID from task name in the current project's tasks
      const selectedTask = projectTasks.find(task => task.taskName === newTaskName);
      
      if (selectedTask) {
        // Update UI with task name and sync to backend with task ID
        updateTimesheet(id, { task: newTaskName });
        debouncedUpdateRef.current(id, { task: selectedTask._id });
      } else {
        // If task not found, just update UI (will be created separately)
        updateTimesheet(id, { task: newTaskName });
      }
    }
  };

  const handleCreateNewTask = async (rowId: string, taskName: string) => {
    const projectId = selectedProjects[rowId];
    if (!projectId) {
      console.error('No project selected for this row');
      return;
    }

    try {
      console.log('Creating new task:', taskName, 'for project:', projectId);
      const newTask: any = await createTask({ projectId, taskName });
      
      // Only sync to backend with new task ID (UI already updated by handleTaskChange)
      if (newTask && newTask._id) {
        debouncedUpdateRef.current(rowId, { task: newTask._id });
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDescriptionChange = (id: string, newDescription: string) => {
    debouncedUpdateRef.current(id, { description: newDescription });
  };

  const handleHoursChange = (id: string, newHours: number) => {
    console.log('MyTimesheetTable - handleHoursChange called with ID:', id, 'hours:', newHours);
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
      render: (row) => row.status,
      width: '5%',
    },
  ];

  const handleRowClick = (row: ITimesheetTableEntry) => {
    console.log('Clicked row:', row);
  };

  // Loading / Error states
  if (projectsLoading) {
    return <div>Loading projects...</div>;
  }

  if (projectsError) {
    return <div>Error loading projects: {projectsError}</div>;
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