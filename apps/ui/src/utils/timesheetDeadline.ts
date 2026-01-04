import dayjs from 'dayjs';
import { checkEditPermissionAPI } from '../api/editPermission';

/**
 * Check if a timesheet entry for a given date is past the edit deadline
 * Rule: Cannot create/edit timesheets for ANY past month (strict blocking)
 * 
 * @param entryDate - The date of the timesheet entry
 * @returns true if past deadline (blocked), false if allowed
 */
export const isTimesheetPastDeadline = (entryDate: Date | string): boolean => {
  const now = dayjs();
  const entry = dayjs(entryDate);
  
  // If the entry is for the current month or future, always allowed
  if (entry.isSame(now, 'month') || entry.isAfter(now, 'month')) {
    return false;
  }
  
  // If the entry is for ANY past month - blocked
  return true;
};

/**
 * Check if a timesheet entry for a given date is blocked (considering approvals)
 * Rule: Cannot create/edit timesheets for past months UNLESS there's an approved edit request
 * 
 * @param entryDate - The date of the timesheet entry
 * @returns Promise<true> if blocked, Promise<false> if allowed
 */
export const isTimesheetBlocked = async (entryDate: Date | string): Promise<boolean> => {
  const now = dayjs();
  const entry = dayjs(entryDate);
  
  // If the entry is for the current month or future, always allowed
  if (entry.isSame(now, 'month') || entry.isAfter(now, 'month')) {
    return false;
  }
  
  // If the entry is for a past month - check if user has approval
  const entryMonth = entry.format('YYYY-MM');
  const entryYear = entry.format('YYYY');
  
  const hasPermission = await checkEditPermissionAPI(entryMonth, entryYear);
  
  // If user has permission (approved request), allow it (not blocked)
  // If user doesn't have permission, block it
  return !hasPermission;
};

/**
 * Get a user-friendly error message for deadline violations
 * 
 * @param entryDate - The date of the timesheet entry
 * @returns Error message string
 */
export const getDeadlineErrorMessage = (entryDate: Date | string): string => {
  const entry = dayjs(entryDate);
  const entryMonth = entry.format('MMMM YYYY');
  
  return `Cannot create or edit timesheets for ${entryMonth}. Please submit an edit request to your supervisor for approval.`;
};

/**
 * Check if a date range contains any dates past the deadline
 * 
 * @param dates - Array of dates to check
 * @returns true if any date is past deadline
 */
export const anyDatePastDeadline = (dates: (Date | string)[]): boolean => {
  return dates.some(date => isTimesheetPastDeadline(date));
};
