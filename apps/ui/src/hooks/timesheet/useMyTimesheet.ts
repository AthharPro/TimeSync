import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setMyTimesheetData, 
  updateMyTimesheetById,
  goToPreviousWeek as previousWeekAction,
  goToNextWeek as nextWeekAction,
  addEmptyCalendarRow,
  updateCalendarRow,
  deleteCalendarRow
} from '../../store/slices/myTimesheetSlice';
import type { RootState } from '../../store/store';
import { IMyTimesheetTableEntry } from '../../interfaces';
import { IUseMyTimesheetReturn } from '../../interfaces';
import { BillableType } from '@tms/shared';

export const useMyTimesheet = (): IUseMyTimesheetReturn => {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const newTimesheets = useSelector((state: RootState) => state.myTimesheet.myTimesheetData);
  const currentWeekStart = useSelector((state: RootState) => state.myTimesheet.currentWeekStart);
  const myCalendarViewData = useSelector((state: RootState) => state.myTimesheet.myCalendarViewData);
  
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
        viewDate: date.toLocaleDateString('en-US', { weekday: 'short' }) + ' , ' + 
                  date.toLocaleDateString('en-US', { month: 'short' }) + ' ' + 
                  date.getDate()
      };
    });
  }, [currentWeekStart]);

  // Add a new timesheet to the Redux store
  const addNewTimesheet = useCallback((timesheet: IMyTimesheetTableEntry) => {
    console.log('useMyTimesheet - addNewTimesheet called with:', timesheet);
    dispatch(setMyTimesheetData(timesheet));
    // Note: setMyTimesheetData already handles adding to calendar view, no need to call addCalendarViewData separately
  }, [dispatch]);

  // Update a timesheet entry by ID
  const updateTimesheet = useCallback((id: string, updates: Partial<IMyTimesheetTableEntry>) => {
    dispatch(updateMyTimesheetById({ id, updates }));
  }, [dispatch]);

  const createEmptyCalendarRow = useCallback((project?: string, task?: string, billableType?: BillableType) => {
    dispatch(addEmptyCalendarRow({ project, task, billableType }));
  }, [dispatch]);

  const updateCalendar = useCallback((oldId: string, newProject: string, newTask: string, newBillableType: BillableType) => {
    dispatch(updateCalendarRow({ oldId, newProject, newTask, newBillableType }));
  }, [dispatch]);

  const deleteCalendar = useCallback((calendarRowId: string) => {
    dispatch(deleteCalendarRow(calendarRowId));
  }, [dispatch]);

  // Week navigation
  const goToPreviousWeek = useCallback(() => {
    dispatch(previousWeekAction());
  }, [dispatch]);

  const goToNextWeek = useCallback(() => {
    dispatch(nextWeekAction());
  }, [dispatch]);

  return {
    // States
    fetchTimesheets,
    newTimesheets,
    myCalendarViewData,
    isLoading,
    error,
    currentWeekDays,
    
    // Actions
    addNewTimesheet,
    updateTimesheet,
    goToPreviousWeek,
    goToNextWeek,
    createEmptyCalendarRow,
    updateCalendar,
    deleteCalendar,
  };
};
