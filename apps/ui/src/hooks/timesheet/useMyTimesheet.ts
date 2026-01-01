import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAllTimesheets,
  setMyTimesheetData,
  updateMyTimesheetById,
  goToPreviousWeek as previousWeekAction,
  goToNextWeek as nextWeekAction,
  addEmptyCalendarRow,
  updateCalendarRow,
  deleteCalendarRow,
  syncTimesheetUpdate,
  deleteTimesheets,
} from '../../store/slices/myTimesheetSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { IMyTimesheetTableEntry } from '../../interfaces';
import { IUseMyTimesheetReturn } from '../../interfaces';
import { BillableType, DailyTimesheetStatus } from '@tms/shared';
import api from '../../config/apiClient';
import { getTimesheets, submitTimesheetsAPI, deleteTimesheetsAPI } from '../../api/timesheet';

export const useMyTimesheet = (): IUseMyTimesheetReturn => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const newTimesheets = useSelector(
    (state: RootState) => state.myTimesheet.myTimesheetData
  );
  const currentWeekStart = useSelector(
    (state: RootState) => state.myTimesheet.currentWeekStart
  );
  const myCalendarViewData = useSelector(
    (state: RootState) => state.myTimesheet.myCalendarViewData
  );

  // Placeholder states (can be moved to Redux later if needed)
  const fetchTimesheets: IMyTimesheetTableEntry[] = [];
  const isLoading = false;
  const error: string | null = null;

  // Calculate current week days based on currentWeekStart from Redux
  const currentWeekDays = useMemo(() => {
    const weekStart = new Date(currentWeekStart);
    return [...Array(7)].map((_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return {
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        viewDate:
          date.toLocaleDateString('en-US', { weekday: 'short' }) +
          ' , ' +
          date.toLocaleDateString('en-US', { month: 'short' }) +
          ' ' +
          date.getDate(),
      };
    });
  }, [currentWeekStart]);

const addNewTimesheet = useCallback(
  async (timesheet: IMyTimesheetTableEntry) => {
    const timesheetReqBody = {
      date: timesheet.date,
      projectId: timesheet.project,
      teamId: timesheet.team,
      taskId: timesheet.task,
      billable: timesheet.billableType,
      description: timesheet.description,
      hours: timesheet.hours
    };

    const res = await api.post("/api/timesheet", timesheetReqBody);
    const ts = res.data;

    // Map backend response → IMyTimesheetTableEntry
    // Backend returns _id, we need to map it to id
    const savedTimesheet: IMyTimesheetTableEntry = {
      id: ts._id || ts.id,           // MongoDB returns _id
      date: ts.date,
      project: ts.projectId || undefined,   // mapped
      team: ts.teamId || undefined,         // mapped
      task: ts.taskId || '',         // mapped
      billableType: ts.billable,     // mapped
      description: ts.description || '',
      hours: ts.hours || 0,
      status: ts.status,
      isChecked: false,
    };

    dispatch(setMyTimesheetData(savedTimesheet));
  },
  [dispatch]
);



  // Update a timesheet entry by ID
  const updateTimesheet = useCallback(
    (id: string, updates: Partial<IMyTimesheetTableEntry>) => {
      dispatch(updateMyTimesheetById({ id, updates }));
    },
    [dispatch]
  );

  // Sync timesheet update to backend API (auto-save)
  const syncUpdateTimesheet = useCallback(
    async (id: string, updates: Partial<IMyTimesheetTableEntry>) => {
      try {
        // Update local state first (optimistic update)
        dispatch(updateMyTimesheetById({ id, updates }));

        // Then sync to backend
        const result = await (dispatch as AppDispatch)(syncTimesheetUpdate({ timesheetId: id, updates }));
        
        if (result.type === syncTimesheetUpdate.rejected.type) {
          console.error('Sync failed:', result.payload);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    },
    [dispatch]
  );

  const createEmptyCalendarRow = useCallback(
    (project?: string, task?: string, billableType?: BillableType) => {
      dispatch(addEmptyCalendarRow({ project, task, billableType }));
    },
    [dispatch]
  );

  const updateCalendar = useCallback(
    (
      oldId: string,
      newProject: string,
      newTask: string,
      newBillableType: BillableType
    ) => {
      dispatch(
        updateCalendarRow({ oldId, newProject, newTask, newBillableType })
      );
    },
    [dispatch]
  );

  const deleteCalendar = useCallback(
    (calendarRowId: string) => {
      dispatch(deleteCalendarRow(calendarRowId));
    },
    [dispatch]
  );

  // Week navigation
  const goToPreviousWeek = useCallback(() => {
    dispatch(previousWeekAction());
  }, [dispatch]);

  const goToNextWeek = useCallback(() => {
    dispatch(nextWeekAction());
  }, [dispatch]);

  // Load timesheets from database
  const loadTimesheets = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      try {
        // Fetch timesheets from API
        const timesheets = await getTimesheets({ startDate, endDate });
        
        // Map backend response to frontend format
        const mappedTimesheets: IMyTimesheetTableEntry[] = timesheets.map((ts: any) => ({
          id: ts.id || ts._id,
          date: ts.date,
          project: ts.projectId || undefined,
          team: ts.teamId || undefined,
          task: ts.taskId || '',
          billableType: ts.billable,
          description: ts.description || '',
          hours: ts.hours || 0,
          status: ts.status,
          isChecked: false,
        }));
        
        // Dispatch action to update Redux state
        dispatch(setAllTimesheets(mappedTimesheets));
      } catch (error) {
        console.error('Load timesheets error:', error);
      }
    },
    [dispatch]
  );

  // Submit selected timesheets
  const submitTimesheets = useCallback(
    async () => {
      try {
        // Get selected timesheets and validate them
        const selectedTimesheets = newTimesheets.filter((ts) => ts.isChecked);

        if (selectedTimesheets.length === 0) {
          throw new Error('No timesheets selected');
        }

        // Filter out invalid timesheets (hours = 0 or missing required fields)
        const validTimesheets = selectedTimesheets.filter((ts) => {
          return (
            ts.hours > 0 &&
            (ts.project || ts.team) && 
            ts.task && 
            ts.description
          );
        });

        if (validTimesheets.length === 0) {
          throw new Error('No valid timesheets to submit. Please ensure all selected timesheets have hours > 0, project/team, task, and description filled in.');
        }

        const invalidCount = selectedTimesheets.length - validTimesheets.length;
        if (invalidCount > 0) {
          const proceed = window.confirm(
            `${invalidCount} timesheet${invalidCount > 1 ? 's' : ''} will be skipped because they are incomplete (missing hours, project/team, task, or description). Continue with ${validTimesheets.length} valid timesheet${validTimesheets.length > 1 ? 's' : ''}?`
          );
          if (!proceed) {
            throw new Error('Submission cancelled');
          }
        }

        const validTimesheetIds = validTimesheets.map((ts) => ts.id);

        // Call API to submit timesheets
        const result = await submitTimesheetsAPI(validTimesheetIds);
        
        // Update Redux state with the returned timesheets (now with Pending status)
        const updatedTimesheets: IMyTimesheetTableEntry[] = result.timesheets.map((ts: any) => ({
          id: ts.id || ts._id,
          date: ts.date,
          project: ts.projectId || undefined,
          team: ts.teamId || undefined,
          task: ts.taskId || '',
          billableType: ts.billable,
          description: ts.description || '',
          hours: ts.hours || 0,
          status: ts.status,
          isChecked: false,
        }));

        // Update each timesheet in Redux
        updatedTimesheets.forEach((ts) => {
          dispatch(updateMyTimesheetById({ id: ts.id, updates: ts }));
        });

        return result;
      } catch (error) {
        console.error('Submit timesheets error:', error);
        throw error;
      }
    },
    [newTimesheets, dispatch]
  );

  // Submit current week timesheets (for calendar view)
  const submitCurrentWeekTimesheets = useCallback(
    async () => {
      try {
        // Calculate week start and end dates
        const weekStart = new Date(currentWeekStart);
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Filter timesheets for current week
        const currentWeekTimesheets = newTimesheets.filter((ts) => {
          const tsDate = new Date(ts.date);
          return tsDate >= weekStart && tsDate <= weekEnd;
        });

        if (currentWeekTimesheets.length === 0) {
          throw new Error('No timesheets found for the current week');
        }

        // Filter for Draft/Default status timesheets only
        const draftTimesheets = currentWeekTimesheets.filter((ts) => {
          return (
            ts.status === DailyTimesheetStatus.Draft || 
            ts.status === DailyTimesheetStatus.Default
          );
        });

        if (draftTimesheets.length === 0) {
          throw new Error('No draft timesheets to submit. All timesheets in this week have already been submitted.');
        }

        // Filter out invalid timesheets (hours = 0 or missing required fields)
        const validTimesheets = draftTimesheets.filter((ts) => {
          return (
            ts.hours > 0 &&
            (ts.project || ts.team) && 
            ts.task
          );
        });

        if (validTimesheets.length === 0) {
          throw new Error('No valid timesheets to submit. Please ensure all timesheets have hours > 0, project/team, and task filled in.');
        }

        const invalidCount = draftTimesheets.length - validTimesheets.length;
        const alreadySubmittedCount = currentWeekTimesheets.length - draftTimesheets.length;
        
        let confirmMessage = '';
        if (invalidCount > 0 && alreadySubmittedCount > 0) {
          confirmMessage = `${invalidCount} timesheet${invalidCount > 1 ? 's' : ''} will be skipped (incomplete) and ${alreadySubmittedCount} timesheet${alreadySubmittedCount > 1 ? 's are' : ' is'} already submitted. Continue with ${validTimesheets.length} valid draft timesheet${validTimesheets.length > 1 ? 's' : ''}?`;
        } else if (invalidCount > 0) {
          confirmMessage = `${invalidCount} timesheet${invalidCount > 1 ? 's' : ''} will be skipped because they are incomplete (missing hours, project/team, or task). Continue with ${validTimesheets.length} valid timesheet${validTimesheets.length > 1 ? 's' : ''}?`;
        } else if (alreadySubmittedCount > 0) {
          confirmMessage = `${alreadySubmittedCount} timesheet${alreadySubmittedCount > 1 ? 's are' : ' is'} already submitted and will be skipped. Continue with ${validTimesheets.length} draft timesheet${validTimesheets.length > 1 ? 's' : ''}?`;
        }
        
        if (confirmMessage) {
          const proceed = window.confirm(confirmMessage);
          if (!proceed) {
            throw new Error('Submission cancelled');
          }
        }

        const validTimesheetIds = validTimesheets.map((ts) => ts.id);

        // Call API to submit timesheets
        const result = await submitTimesheetsAPI(validTimesheetIds);
        
        // Update Redux state with the returned timesheets (now with Pending status)
        const updatedTimesheets: IMyTimesheetTableEntry[] = result.timesheets.map((ts: any) => ({
          id: ts.id || ts._id,
          date: ts.date,
          project: ts.projectId || undefined,
          team: ts.teamId || undefined,
          task: ts.taskId || '',
          billableType: ts.billable,
          description: ts.description || '',
          hours: ts.hours || 0,
          status: ts.status,
          isChecked: false,
        }));

        // Update each timesheet in Redux
        updatedTimesheets.forEach((ts) => {
          dispatch(updateMyTimesheetById({ id: ts.id, updates: ts }));
        });

        return result;
      } catch (error) {
        console.error('Submit current week timesheets error:', error);
        throw error;
      }
    },
    [newTimesheets, currentWeekStart, dispatch]
  );

  // Delete selected timesheets (only drafts)
  const deleteSelectedTimesheets = useCallback(
    async () => {
      try {
        // Get selected timesheets
        const selectedTimesheets = newTimesheets.filter((ts) => ts.isChecked);

        if (selectedTimesheets.length === 0) {
          throw new Error('No timesheets selected');
        }

        // Filter to only allow deleting draft timesheets (status is Default or Draft)
        const draftTimesheets = selectedTimesheets.filter((ts) => {
          return ts.status === DailyTimesheetStatus.Default || ts.status === DailyTimesheetStatus.Draft;
        });

        if (draftTimesheets.length === 0) {
          throw new Error('No draft timesheets selected. Only draft timesheets can be deleted.');
        }

        const nonDraftCount = selectedTimesheets.length - draftTimesheets.length;
        if (nonDraftCount > 0) {
          const proceed = window.confirm(
            `${nonDraftCount} timesheet${nonDraftCount > 1 ? 's' : ''} cannot be deleted because they are not drafts. Delete ${draftTimesheets.length} draft timesheet${draftTimesheets.length > 1 ? 's' : ''}?`
          );
          if (!proceed) {
            throw new Error('Deletion cancelled');
          }
        }

        const draftTimesheetIds = draftTimesheets.map((ts) => ts.id);

        // Call API to delete timesheets
        await deleteTimesheetsAPI(draftTimesheetIds);
        
        // Update Redux state by removing deleted timesheets
        dispatch(deleteTimesheets(draftTimesheetIds));

        return {
          deleted: draftTimesheets.length,
        };
      } catch (error) {
        console.error('Delete timesheets error:', error);
        throw error;
      }
    },
    [newTimesheets, dispatch]
  );

  return {
    // States
    newTimesheets,
    fetchTimesheets: [], // Deprecated, keeping for backward compatibility
    myCalendarViewData,
    isLoading,
    error,
    currentWeekDays,
    currentWeekStart: new Date(currentWeekStart), // Convert ISO string to Date

    // Actions
    addNewTimesheet,
    updateTimesheet,
    syncUpdateTimesheet,
    goToPreviousWeek,
    goToNextWeek,
    createEmptyCalendarRow,
    updateCalendar,
    deleteCalendar,
    loadTimesheets,
    submitTimesheets,
    submitCurrentWeekTimesheets,
    deleteSelectedTimesheets,
  };
};
