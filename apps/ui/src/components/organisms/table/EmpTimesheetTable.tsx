import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Checkbox,
  CircularProgress,
  Typography,
} from '@mui/material';
import { BillableType, DailyTimesheetStatus } from '@tms/shared';
import { BaseTextField } from '../../atoms';
import HoursField from '../../atoms/other/inputField/HoursField';
import Dropdown from '../../atoms/other/inputField/Dropdown';
import AutocompleteWithCreate from '../../atoms/other/inputField/AutocompleteWithCreate';
import { useReviewTimesheet } from '../../../hooks/timesheet';
import { useTasks } from '../../../hooks/task/useTasks';
import StatusChip from '../../atoms/other/Icon/StatusChip';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import api from '../../../config/apiClient';
import { ReviewTimesheetFilters } from '../popover/ReviewTimesheetFilterPopover';

// Interface for employee timesheet entry
interface IEmpTimesheetEntry {
  id: string;
  date: string;
  project: string;
  projectId?: string;
  isPublicProject?: boolean;
  teamId?: string;
  isDepartmentTeam?: boolean;
  task: string;
  taskId?: string;
  description: string;
  hours: number;
  billableType: BillableType;
  status: DailyTimesheetStatus;
  isChecked?: boolean;
  isSupervised?: boolean; // Whether the supervisor has permission to edit this timesheet
}

interface EmpTimesheetTableProps {
  employeeId: string;
  onSelectedTimesheetsChange?: (timesheetIds: string[]) => void;
  filters?: ReviewTimesheetFilters;
  supervisedProjectIds?: string[];
  supervisedTeamIds?: string[];
  nonDeptTeamEmployeeIds?: string[];
}

// Billable type options as Record
const billableTypeOptions: Record<string, BillableType> = {
  'Billable': BillableType.Billable,
  'Non-Billable': BillableType.NonBillable,
};

const EmpTimesheetTable: React.FC<EmpTimesheetTableProps> = ({ 
  employeeId, 
  onSelectedTimesheetsChange, 
  filters,
  supervisedProjectIds = [],
  supervisedTeamIds = [],
  nonDeptTeamEmployeeIds = []
}) => {
  const {
    loadEmployeeTimesheets,
    getEmployeeTimesheets,
    isEmployeeTimesheetsLoading,
    getEmployeeTimesheetsError,
  } = useReviewTimesheet();

  const { loadTasks, createTask } = useTasks();

  // Get all tasks from Redux store
  const tasksByProject = useSelector((state: RootState) => state.tasks.tasksByProject);
  
  // Track which projects we've already loaded tasks for
  const loadedProjectsRef = useRef<Set<string>>(new Set());
  
  // Debounce timer refs
  const descriptionTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const hoursTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // State to manage timesheet data
  const [timesheetData, setTimesheetData] = useState<IEmpTimesheetEntry[]>([]);

  // Get data from Redux store
  const timesheets = getEmployeeTimesheets(employeeId);
  const loading = isEmployeeTimesheetsLoading(employeeId);
  const error = getEmployeeTimesheetsError(employeeId);

  // Fetch timesheet data when component mounts or employeeId/filters change
  useEffect(() => {
    if (filters && filters.startDate && filters.endDate) {
      loadEmployeeTimesheets(employeeId, {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate)
      });
    } else {
      loadEmployeeTimesheets(employeeId);
    }
  }, [employeeId, filters?.startDate, filters?.endDate, loadEmployeeTimesheets]);

  // Load tasks for projects in the timesheets
  useEffect(() => {
    if (timesheets) {
      const projectIds = new Set<string>();
      timesheets.forEach((ts: any) => {
        if (ts.projectId && !loadedProjectsRef.current.has(ts.projectId)) {
          projectIds.add(ts.projectId);
        }
      });
      
      // Load tasks for each project
      projectIds.forEach(projectId => {
        loadTasks(projectId);
        loadedProjectsRef.current.add(projectId);
      });
    }
  }, [timesheets, loadTasks]);

  // Update local state when Redux data changes
  useEffect(() => {
    console.log('=== EmpTimesheetTable useEffect triggered ===');
    console.log('Supervised Project IDs received:', supervisedProjectIds);
    console.log('Supervised Team IDs received:', supervisedTeamIds);
    console.log('Non-Dept Team Employee IDs received:', nonDeptTeamEmployeeIds);
    console.log('Current Employee ID:', employeeId);
    
    if (timesheets) {
      // Check if this employee is in a non-department team
      const isEmployeeInNonDeptTeam = nonDeptTeamEmployeeIds.includes(employeeId);
      console.log('Is employee in non-department team?', isEmployeeInNonDeptTeam);
      
      const transformedData: IEmpTimesheetEntry[] = timesheets.map((ts: any) => {
        // Check if this timesheet is from a public project
        const isFromPublicProject = ts.isPublicProject === true;
        
        // Check if this timesheet is supervised based on project or team
        const isProjectSupervised = ts.projectId && supervisedProjectIds.length > 0 && supervisedProjectIds.includes(ts.projectId);
        const isTeamSupervised = ts.teamId && supervisedTeamIds.length > 0 && supervisedTeamIds.includes(ts.teamId);
        
        // IMPORTANT: Permission logic for supervision:
        // 1. If timesheet is from a public project (isPublic: true), ANY supervisor can edit
        // 2. If employee is in a non-department team (isDepartment: false), supervisor can edit ALL timesheets
        // 3. Otherwise, supervisor can only edit timesheets from projects/teams they supervise
        const isSupervised = isFromPublicProject || isEmployeeInNonDeptTeam || isProjectSupervised || isTeamSupervised;
        
        // Debug logging
        console.log('===== TIMESHEET SUPERVISION CHECK =====');
        console.log('Processing Timesheet:', {
          project: ts.project,
          projectId: ts.projectId,
          isPublicProject: ts.isPublicProject,
          teamId: ts.teamId,
          isDepartmentTeam: ts.isDepartmentTeam,
          isFromPublicProject,
          isProjectSupervised,
          isTeamSupervised,
          isEmployeeInNonDeptTeam,
          isSupervised,
          supervisedProjectIdsCount: supervisedProjectIds.length,
          supervisedTeamIdsCount: supervisedTeamIds.length,
          nonDeptTeamEmployeeIdsCount: nonDeptTeamEmployeeIds.length,
        });
        
        return {
          id: ts.id,
          date: ts.date,
          project: ts.project,
          projectId: ts.projectId,
          isPublicProject: ts.isPublicProject,
          teamId: ts.teamId,
          isDepartmentTeam: ts.isDepartmentTeam,
          task: ts.task,
          taskId: ts.taskId,
          description: ts.description,
          hours: ts.hours,
          billableType: ts.billableType as BillableType,
          status: ts.status as DailyTimesheetStatus,
          isChecked: false,
          isSupervised,
        };
      });
      setTimesheetData(transformedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timesheets, supervisedProjectIds.join(','), supervisedTeamIds.join(','), nonDeptTeamEmployeeIds.join(','), employeeId]);
  // Use join(',') to create a stable string representation of arrays for comparison

  // Apply client-side filters to timesheet data
  const filteredTimesheetData = useMemo(() => {
    if (!filters) return timesheetData;

    return timesheetData.filter((entry) => {
      // Filter by status
      if (filters.status && filters.status !== 'All') {
        if (entry.status !== filters.status) {
          return false;
        }
      }

      // Filter by project
      if (filters.filterBy === 'project' && filters.projectId && filters.projectId !== 'All') {
        if (entry.projectId !== filters.projectId) {
          return false;
        }
      }

      // Note: Team filtering would need to be done on the backend
      // as we don't have team information in the timesheet entries

      return true;
    });
  }, [timesheetData, filters]);

  // Notify parent of selected timesheets when selection changes
  useEffect(() => {
    if (onSelectedTimesheetsChange) {
      const selectedIds = timesheetData
        .filter(entry => entry.isChecked && entry.status === DailyTimesheetStatus.Pending)
        .map(entry => entry.id);
      onSelectedTimesheetsChange(selectedIds);
    }
  }, [timesheetData, onSelectedTimesheetsChange]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      // Clear all description timers
      descriptionTimerRef.current.forEach((timer) => clearTimeout(timer));
      descriptionTimerRef.current.clear();
      
      // Clear all hours timers
      hoursTimerRef.current.forEach((timer) => clearTimeout(timer));
      hoursTimerRef.current.clear();
    };
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (id: string) => {
    setTimesheetData((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, isChecked: !entry.isChecked } : entry))
    );
  };

  // Handle select all checkbox
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    // Only select Pending timesheets that are supervised
    setTimesheetData((prev) =>
      prev.map((entry) => ({
        ...entry,
        isChecked: entry.status === DailyTimesheetStatus.Pending && entry.isSupervised ? checked : entry.isChecked,
      }))
    );
  };

  // Check if all Pending and supervised entries are selected
  const pendingAndSupervisedTimesheets = timesheetData.filter(
    entry => entry.status === DailyTimesheetStatus.Pending && entry.isSupervised
  );
  const isAllSelected = pendingAndSupervisedTimesheets.length > 0 && 
    pendingAndSupervisedTimesheets.every((entry) => entry.isChecked);
  const isIndeterminate = pendingAndSupervisedTimesheets.some((entry) => entry.isChecked) && !isAllSelected;

  // Get available tasks for a specific entry based on its project
  const getAvailableTasksForEntry = (entry: IEmpTimesheetEntry): string[] => {
    if (!entry.projectId) return [];
    const projectTasks = tasksByProject[entry.projectId] || [];
    return projectTasks.map(task => task.taskName);
  };

  // Handle task change
  const handleTaskChange = async (entry: IEmpTimesheetEntry, event: any, value: string | null) => {
    if (value) {
      // Get the project's tasks
      const projectTasks = entry.projectId ? tasksByProject[entry.projectId] || [] : [];
      
      // Find the task ID from task name in the current project's tasks
      const selectedTask = projectTasks.find(task => task.taskName === value);
      
      if (selectedTask) {
        // Update UI with both task name (for display) and task ID
        setTimesheetData((prev) =>
          prev.map((item) => (item.id === entry.id ? { ...item, task: value, taskId: selectedTask._id } : item))
        );
        
        // Persist to backend with task ID using review endpoint
        try {
          await api.put(`/api/review/timesheets/${entry.id}`, { taskId: selectedTask._id });
          console.log('Task updated successfully in database');
        } catch (error) {
          console.error('Failed to update task in database:', error);
        }
      } else {
        // If task not found, just update display name (will be created separately)
        setTimesheetData((prev) =>
          prev.map((item) => (item.id === entry.id ? { ...item, task: value } : item))
        );
      }
    }
  };

  // Handle create new task
  const handleCreateNewTask = async (entry: IEmpTimesheetEntry, taskName: string) => {
    const projectId = entry.projectId;
    if (!projectId) {
      console.error('No project ID for this entry');
      return;
    }

    try {
      console.log('Creating new task:', taskName, 'for project:', projectId);
      const newTask: any = await createTask({ projectId, taskName });
      
      // Update UI with the new task
      if (newTask && newTask._id) {
        setTimesheetData((prev) =>
          prev.map((item) => (item.id === entry.id ? { ...item, task: taskName, taskId: newTask._id } : item))
        );
        
        // Persist to backend with new task ID using review endpoint
        try {
          await api.put(`/api/review/timesheets/${entry.id}`, { taskId: newTask._id });
          console.log('Created and updated task successfully in database');
        } catch (error) {
          console.error('Failed to update timesheet with new task in database:', error);
        }
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Handle description change with debouncing
  const handleDescriptionChange = useCallback((id: string, value: string) => {
    // Update UI immediately
    setTimesheetData((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, description: value } : entry))
    );
    
    // Clear existing timer for this entry
    const existingTimer = descriptionTimerRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer to persist to backend after 900ms using review endpoint
    const timer = setTimeout(async () => {
      try {
        await api.put(`/api/review/timesheets/${id}`, { description: value });
        console.log('Description updated successfully in database');
      } catch (error) {
        console.error('Failed to update description in database:', error);
      }
      descriptionTimerRef.current.delete(id);
    }, 900);
    
    descriptionTimerRef.current.set(id, timer);
  }, []);

  // Handle hours change with debouncing
  const handleHoursChange = useCallback((id: string, value: number) => {
    // Update UI immediately
    setTimesheetData((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, hours: value } : entry))
    );
    
    // Clear existing timer for this entry
    const existingTimer = hoursTimerRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer to persist to backend after 900ms using review endpoint
    const timer = setTimeout(async () => {
      try {
        await api.put(`/api/review/timesheets/${id}`, { hours: value });
        console.log('Hours updated successfully in database');
      } catch (error) {
        console.error('Failed to update hours in database:', error);
      }
      hoursTimerRef.current.delete(id);
    }, 900);
    
    hoursTimerRef.current.set(id, timer);
  }, []);

  // Handle billable type change (immediate update, no debounce needed)
  const handleBillableTypeChange = useCallback(async (id: string, value: string) => {
    // Update UI
    setTimesheetData((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, billableType: value as BillableType } : entry))
    );
    
    // Persist to backend immediately using review endpoint
    try {
      await api.put(`/api/review/timesheets/${id}`, { billable: value });
      console.log('Billable type updated successfully in database');
    } catch (error) {
      console.error('Failed to update billable type in database:', error);
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Show empty state
  if (timesheetData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography color="text.secondary">
          No timesheets found for this employee.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '50px' }} padding="checkbox">
                <Checkbox
                  size="small"
                  sx={{ paddingTop: 0, paddingBottom: 0 }}
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '110px' }}>
                Date
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '180px' }}>
                Project
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '200px' }}>
                Task
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600 }}>
                Description
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '100px' }} align="center">
                Hours
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '130px' }}>
                Type
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 600, width: '100px' }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTimesheetData.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={entry.isChecked || false}
                    onChange={() => handleCheckboxChange(entry.id)}
                    disabled={entry.status !== DailyTimesheetStatus.Pending || !entry.isSupervised}
                  />
                </TableCell>
                <TableCell>
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>{entry.project}</TableCell>
                <TableCell>
                  <AutocompleteWithCreate
                    options={getAvailableTasksForEntry(entry)}
                    value={entry.task}
                    onChange={(event, value) => handleTaskChange(entry, event, value)}
                    onCreateNew={(taskName) => handleCreateNewTask(entry, taskName)}
                    placeholder="Select or create task"
                    disabled={entry.status !== DailyTimesheetStatus.Pending || !entry.isSupervised}
                  />
                </TableCell>
                <TableCell>
                  <BaseTextField
                    value={entry.description}
                    onChange={(e) => handleDescriptionChange(entry.id, e.target.value)}
                    placeholder="Enter description"
                    multiline
                    fullWidth
                    variant="standard"
                    disabled={entry.status !== DailyTimesheetStatus.Pending || !entry.isSupervised}
                    sx={{
                      '& .MuiInput-underline:before': { borderBottom: 'none' },
                      '& .MuiInput-underline:after': { borderBottom: 'none' },
                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                        borderBottom: 'none',
                      },
                      '& .MuiInput-underline.Mui-disabled:before': {
                        borderBottom: 'none !important',
                      },
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'rgba(0, 0, 0, 0.6)',
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <HoursField
                    value={entry.hours}
                    onChange={(value) => handleHoursChange(entry.id, value)}
                    disabled={entry.status !== DailyTimesheetStatus.Pending || !entry.isSupervised}
                  />
                </TableCell>
                <TableCell>
                  <Dropdown
                    value={entry.billableType}
                    onChange={(value) => handleBillableTypeChange(entry.id, value)}
                    options={billableTypeOptions}
                    disabled={entry.status !== DailyTimesheetStatus.Pending || !entry.isSupervised}
                  />
                </TableCell>
                <TableCell>
                  <StatusChip status={entry.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmpTimesheetTable;
