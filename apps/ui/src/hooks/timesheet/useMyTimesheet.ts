import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMyTimesheetData, updateMyTimesheetById } from '../../store/slices/myTimesheetSlice';
import type { RootState } from '../../store/store';
import { IMyTimesheetTableEntry } from '../../interfaces';
import { IUseMyTimesheetReturn } from '../../interfaces';

export const useMyTimesheet = (): IUseMyTimesheetReturn => {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const newTimesheets = useSelector((state: RootState) => state.myTimesheet.myTimesheetData);
  
  // Placeholder states (can be moved to Redux later if needed)
  const fetchTimesheets: IMyTimesheetTableEntry[] = [];
  const isLoading = false;
  const error: string | null = null;

  // Add a new timesheet to the Redux store
  const addNewTimesheet = useCallback((timesheet: IMyTimesheetTableEntry) => {
    dispatch(setMyTimesheetData(timesheet));
  }, [dispatch]);

  // Update a timesheet entry by ID
  const updateTimesheet = useCallback((id: string, updates: Partial<IMyTimesheetTableEntry>) => {
    dispatch(updateMyTimesheetById({ id, updates }));
  }, [dispatch]);

  return {
    // States
    fetchTimesheets,
    newTimesheets,
    isLoading,
    error,
    
    // Actions
    addNewTimesheet,
    updateTimesheet,
  };
};
