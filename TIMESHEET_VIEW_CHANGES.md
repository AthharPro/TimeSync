# Timesheet View Changes Summary

## Changes Made

### 1. **Table View - Default Filter to Current Month**

**File Modified:** `apps/ui/src/components/organisms/window/MyTimesheetWindow.tsx`

**Changes:**
- Added `dayjs` import for date handling
- Changed `useState` import to include `useMemo`
- Created `defaultTableFilters` using `useMemo` that sets:
  - **Year**: Current year (e.g., "2025")
  - **Month**: Current month (e.g., "2025-12")
  - **Start Date**: First day of current month
  - **End Date**: Last day of current month
  - **Status**: "All"
  - **Project**: "All"
- Updated initial state of `filters` to use `defaultTableFilters` instead of null values

**Result:**
- Table view now displays timesheets for the **current year and current month** by default
- Users can still use the filter button to change date ranges, status, and projects

### 2. **Table View - Load Data Based on Filters**

**File Modified:** `apps/ui/src/components/organisms/table/MyTimesheetTable.tsx`

**Changes:**
- Removed unused imports: `currentWeekDays`, `currentWeekStart` from `useMyTimesheet` hook
- Removed unused `loadedWeekRef` reference that was tracking week changes
- Updated the timesheet loading `useEffect` to:
  - Load timesheets based on **filter dates** instead of current week
  - Trigger when `filters.startDate` or `filters.endDate` changes
  - Only load if both start and end dates are provided

**Result:**
- Table view is now independent of week navigation
- Data loads based on the selected date range in filters
- By default, loads current month's data

### 3. **Calendar View - Remains Week-Based**

**File:** `apps/ui/src/components/organisms/table/MyTimesheetCalenderTable.tsx`

**Status:** No changes needed

**Result:**
- Calendar view continues to display week-by-week as before
- Uses `WeekNavigator` component for navigation
- Loads data for the current week and updates when navigating between weeks

## Behavior Summary

### Table View 📊
- **Default Display**: Current year + Current month (e.g., December 2025)
- **Navigation**: Filter button to change date ranges
- **Date Options in Filter**:
  - Year picker
  - Month picker  
  - Custom date range (start/end dates)
  - Status filter
  - Project filter

### Calendar View 📅
- **Default Display**: Current week (Monday - Sunday)
- **Navigation**: Week navigator (Previous/Next buttons)
- **Data Loading**: Automatically loads timesheets for the displayed week
- **Display Format**: Calendar grid showing all days of the week

## User Experience

1. **Opening Timesheet Page**: 
   - Table view shows all timesheets from the current month
   
2. **Switching to Calendar View**:
   - Displays current week in calendar format
   - Can navigate week by week
   
3. **Switching Back to Table View**:
   - Returns to filtered view (maintains last applied filters)
   
4. **Filtering in Table View**:
   - Can select any year, month, or custom date range
   - Filters are preserved until changed or reset

## Testing Recommendations

1. ✅ Verify table view loads current month's data on initial load
2. ✅ Test filter functionality (year, month, custom dates, status, project)
3. ✅ Confirm calendar view shows current week with week navigation
4. ✅ Test switching between table and calendar views
5. ✅ Verify data loads correctly when changing filters
6. ✅ Test create, edit, submit, and delete operations in both views
