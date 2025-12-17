import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { IMyTimesheetTableEntry, ITimesheetState, IMyTimesheetCalendarEntry } from '../../interfaces';
import { BillableType } from '@tms/shared';
import api from '../../config/apiClient';
import { getTimesheets } from '../../api/timesheet';

// Async thunk for fetching timesheets from the backend
export const fetchTimesheets = createAsyncThunk(
  'myTimesheet/fetchTimesheets',
  async (
    params: { startDate?: Date; endDate?: Date },
    { rejectWithValue }
  ) => {
    try {
      const timesheets = await getTimesheets(params);
      return timesheets;
    } catch (error: any) {
      console.error('fetchTimesheets - Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch timesheets');
    }
  }
);

// Async thunk for syncing timesheet updates to the backend
export const syncTimesheetUpdate = createAsyncThunk(
  'myTimesheet/syncUpdate',
  async (
    params: { 
      timesheetId: string; 
      updates: Partial<IMyTimesheetTableEntry>;
    },
    { rejectWithValue }
  ) => {
    try {
      // Map frontend field names to backend field names
      const backendUpdates: any = {};
      
      if (params.updates.date !== undefined && params.updates.date !== null) {
        const dateValue = params.updates.date as string | Date;
        if (typeof dateValue === 'string') {
          backendUpdates.date = new Date(dateValue).toISOString();
        } else if (dateValue instanceof Date) {
          backendUpdates.date = dateValue.toISOString();
        } else {
          backendUpdates.date = dateValue;
        }
      }
      if (params.updates.hours !== undefined && params.updates.hours !== null) {
        backendUpdates.hours = Number(params.updates.hours);
      }
      if (params.updates.description !== undefined && params.updates.description !== null) {
        backendUpdates.description = String(params.updates.description);
      }
      if (params.updates.billableType !== undefined && params.updates.billableType !== null) {
        backendUpdates.billable = String(params.updates.billableType);
      }
      // Map project to projectId
      if (params.updates.project !== undefined && params.updates.project !== null) {
        backendUpdates.projectId = String(params.updates.project);
      }
      // Map task to taskId
      if (params.updates.task !== undefined && params.updates.task !== null) {
        backendUpdates.taskId = String(params.updates.task);
      }

      const response = await api.put(`/api/timesheet/${params.timesheetId}`, backendUpdates);


      return {
        timesheetId: params.timesheetId,
        updates: params.updates,
      };
    } catch (error: any) {
      console.error('syncTimesheetUpdate - API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update timesheet');
    }
  }
);

// Helper function to get the start of the week (Sunday)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diff = d.getDate() - day; // Adjust to get Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Reset time to midnight
  return d;
};

const initialState: ITimesheetState = {
  myTimesheetData: [],
  myCalendarViewData: [],
  currentWeekStart: getWeekStart(new Date()).toISOString(),
  loading: false,
  error: null,
};

const myTimesheetSlice = createSlice({
  name: 'myTimesheet',
  initialState,
  reducers: {

    setAllTimesheets: (state, action: PayloadAction<IMyTimesheetTableEntry[]>) => {
      
      // Replace all timesheets with the new data
      state.myTimesheetData = action.payload;
      
      // Rebuild calendar view from timesheets
      const calendarMap = new Map<string, IMyTimesheetCalendarEntry>();

      action.payload.forEach((ts) => {
        if (!ts.project || !ts.task) return; // Skip incomplete entries
        
        const key = `${ts.project}|${ts.task}|${ts.billableType}`;
        
        if (!calendarMap.has(key)) {
          calendarMap.set(key, {
            id: key,
            project: ts.project,
            task: ts.task,
            billableType: ts.billableType,
            myTimesheetEntriesIds: [],
          });
        }
        
        calendarMap.get(key)!.myTimesheetEntriesIds.push(ts.id);
      });

      state.myCalendarViewData = Array.from(calendarMap.values());
    },

    setMyTimesheetData: (state, action: PayloadAction<IMyTimesheetTableEntry>) => {
      state.myTimesheetData.unshift(action.payload);
      
      // Add to calendar view inline
      const data = action.payload;
      const project = data.project;
      const task = data.task;
      const billable = data.billableType;

      // Only add to calendar view if project and task are not empty
      if (!project || !task) {
        return;
      }

      // Create unique ID with separator to avoid collisions
      const id = `${project}|${task}|${billable}`;
      
      
      // Check if entry with this id already exists
      const existingIndex = state.myCalendarViewData.findIndex((entry: IMyTimesheetCalendarEntry) => entry.id === id);

      if (existingIndex !== -1) {
        // Entry exists - add the timesheet ID to its myTimesheetEntriesIds array
        if (!state.myCalendarViewData[existingIndex].myTimesheetEntriesIds.includes(data.id)) {
          state.myCalendarViewData[existingIndex].myTimesheetEntriesIds.push(data.id);
        }
      } else {
        // Entry doesn't exist - create a new calendar entry
        const newCalendarEntry: IMyTimesheetCalendarEntry = {
          id,
          project,
          task,
          billableType: billable,
          myTimesheetEntriesIds: [data.id]
        };
        state.myCalendarViewData.unshift(newCalendarEntry);
      }
      
    },

    updateMyTimesheetEntry: (state, action: PayloadAction<{ index: number; updates: Partial<IMyTimesheetTableEntry> }>) => {
      const { index, updates } = action.payload;
      if (state.myTimesheetData[index]) {
        state.myTimesheetData[index] = { ...state.myTimesheetData[index], ...updates };
      }
    },

    updateMyTimesheetById: (state, action: PayloadAction<{ id: string; updates: Partial<IMyTimesheetTableEntry> }>) => {
      const { id, updates } = action.payload;
      const index = state.myTimesheetData.findIndex(entry => entry.id === id);
      if (index !== -1) {
        const oldEntry = state.myTimesheetData[index];
        const updatedEntry = { ...oldEntry, ...updates };
        state.myTimesheetData[index] = updatedEntry;

        // Check if project, task, or billableType changed - need to update calendar view
        const keysChanged = updates.project !== undefined || updates.task !== undefined || updates.billableType !== undefined;
        
        if (keysChanged) {
          
          // Check if old entry had empty project/task
          const oldHasEmpty = !oldEntry.project || !oldEntry.task;
          const newHasEmpty = !updatedEntry.project || !updatedEntry.task;
          
          // Create old and new IDs
          const oldId = `${oldEntry.project}|${oldEntry.task}|${oldEntry.billableType}`;
          const newId = `${updatedEntry.project}|${updatedEntry.task}|${updatedEntry.billableType}`;
          
          
          if (oldId !== newId) {
            // IDs are different - need to move entry to different calendar row
            
            // 1. Remove timesheet ID from old calendar entry (only if old had valid project/task)
            if (!oldHasEmpty) {
              const oldCalendarIndex = state.myCalendarViewData.findIndex(cal => cal.id === oldId);
              if (oldCalendarIndex !== -1) {
                const idIndex = state.myCalendarViewData[oldCalendarIndex].myTimesheetEntriesIds.indexOf(id);
                if (idIndex !== -1) {
                  state.myCalendarViewData[oldCalendarIndex].myTimesheetEntriesIds.splice(idIndex, 1);
                  
                  // If no more timesheet IDs, remove the calendar row
                  if (state.myCalendarViewData[oldCalendarIndex].myTimesheetEntriesIds.length === 0) {
                    state.myCalendarViewData.splice(oldCalendarIndex, 1);
                  }
                }
              }
            }
            
            // 2. Add timesheet ID to new calendar entry (only if new has valid project/task)
            if (!newHasEmpty) {
              const newCalendarIndex = state.myCalendarViewData.findIndex(cal => cal.id === newId);
              if (newCalendarIndex !== -1) {
                // Calendar entry exists - add ID to it
                if (!state.myCalendarViewData[newCalendarIndex].myTimesheetEntriesIds.includes(id)) {
                  state.myCalendarViewData[newCalendarIndex].myTimesheetEntriesIds.push(id);
                }
              } else {
                // Calendar entry doesn't exist - create new one
                const newCalendarEntry: IMyTimesheetCalendarEntry = {
                  id: newId,
                  project: updatedEntry.project,
                  task: updatedEntry.task,
                  billableType: updatedEntry.billableType,
                  myTimesheetEntriesIds: [id]
                };
                state.myCalendarViewData.unshift(newCalendarEntry);
              }
            }
          }
          // Note: If oldId === newId, no need to move the ID, it stays in the same calendar row
        }
        // Note: For non-key field updates (hours, description, etc.), the ID reference stays the same
      }
    },

    // Week navigation actions
    goToPreviousWeek: (state) => {
      const currentWeek = new Date(state.currentWeekStart);
      currentWeek.setDate(currentWeek.getDate() - 7);
      state.currentWeekStart = currentWeek.toISOString();
    },

    goToNextWeek: (state) => {
      const currentWeek = new Date(state.currentWeekStart);
      currentWeek.setDate(currentWeek.getDate() + 7);
      state.currentWeekStart = currentWeek.toISOString();
    },

    setCurrentWeek: (state, action: PayloadAction<Date>) => {
      state.currentWeekStart = getWeekStart(action.payload).toISOString();
    },

    // Calendar view 
    addCalendarViewRow: (state, action: PayloadAction<IMyTimesheetTableEntry>) => {
      const data = action.payload;
      const project = data.project;
      const task = data.task;
      const billable = data.billableType;

      // Only add to calendar view if project and task are not empty
      if (!project || !task) {
        return;
      }

      // Create unique ID with separator to avoid collisions
      const id = `${project}|${task}|${billable}`;
      
      
      // Check if entry with this id already exists
      const existingIndex = state.myCalendarViewData.findIndex((entry: IMyTimesheetCalendarEntry) => entry.id === id);

      if (existingIndex !== -1) {
        // Entry exists - add the timesheet ID to its myTimesheetEntriesIds array
        if (!state.myCalendarViewData[existingIndex].myTimesheetEntriesIds.includes(data.id)) {
          state.myCalendarViewData[existingIndex].myTimesheetEntriesIds.push(data.id);
        }
      } else {
        // Entry doesn't exist - create a new calendar entry
        const newCalendarEntry: IMyTimesheetCalendarEntry = {
          id,
          project,
          task,
          billableType: billable,
          myTimesheetEntriesIds: [data.id]
        };
        state.myCalendarViewData.unshift(newCalendarEntry);
      }
      
    },

    // Add empty calendar row for direct creation in calendar view
    addEmptyCalendarRow: (state, action: PayloadAction<{ project?: string; task?: string; billableType?: BillableType }>) => {
      const { project = 'New Project', task = 'New Task', billableType = BillableType.NonBillable } = action.payload;
      const id = `${project}|${task}|${billableType}`;
      
      
      // Check if entry with this id already exists
      const existingIndex = state.myCalendarViewData.findIndex((entry: IMyTimesheetCalendarEntry) => entry.id === id);
      
      if (existingIndex === -1) {
        // Create new calendar entry with no timesheet IDs
        const newCalendarEntry: IMyTimesheetCalendarEntry = {
          id,
          project,
          task,
          billableType,
          myTimesheetEntriesIds: []
        };
        state.myCalendarViewData.unshift(newCalendarEntry);
      }
    },

    // Update calendar row metadata (project, task, billableType)
    updateCalendarRow: (state, action: PayloadAction<{ oldId: string; newProject: string; newTask: string; newBillableType: BillableType }>) => {
      const { oldId, newProject, newTask, newBillableType } = action.payload;
      const newId = `${newProject}|${newTask}|${newBillableType}`;
      
      
      const oldIndex = state.myCalendarViewData.findIndex(row => row.id === oldId);
      if (oldIndex !== -1) {
        const oldRow = state.myCalendarViewData[oldIndex];
        
        // Check if new ID already exists
        const newIndex = state.myCalendarViewData.findIndex(row => row.id === newId);
        
        if (newIndex !== -1 && newId !== oldId) {
          // New ID exists - merge timesheet IDs into existing row
          const existingIds = state.myCalendarViewData[newIndex].myTimesheetEntriesIds;
          oldRow.myTimesheetEntriesIds.forEach(id => {
            if (!existingIds.includes(id)) {
              existingIds.push(id);
            }
          });
          // Remove old row
          state.myCalendarViewData.splice(oldIndex, 1);
        } else {
          // Update in place
          state.myCalendarViewData[oldIndex] = {
            ...oldRow,
            id: newId,
            project: newProject,
            task: newTask,
            billableType: newBillableType
          };
        }
      }
    },

    // Delete calendar row and all associated timesheets
    deleteCalendarRow: (state, action: PayloadAction<string>) => {
      const calendarRowId = action.payload;
      
      const calendarIndex = state.myCalendarViewData.findIndex(row => row.id === calendarRowId);
      if (calendarIndex !== -1) {
        const calendarRow = state.myCalendarViewData[calendarIndex];
        
        // Delete all associated timesheet entries
        const timesheetIdsToDelete = calendarRow.myTimesheetEntriesIds;
        
        state.myTimesheetData = state.myTimesheetData.filter(
          timesheet => !timesheetIdsToDelete.includes(timesheet.id)
        );
        
        // Remove the calendar row
        state.myCalendarViewData.splice(calendarIndex, 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch timesheets
      .addCase(fetchTimesheets.pending, () => {
        // Pending state - could add loading state here
      })
      .addCase(fetchTimesheets.fulfilled, (state, action) => {
        
        // Map backend response to frontend format
        const mappedTimesheets: IMyTimesheetTableEntry[] = action.payload.map((ts: any) => ({
          id: ts.id || ts._id,
          date: ts.date,
          project: ts.projectId || '',
          task: ts.taskId || '',
          billableType: ts.billable,
          description: ts.description || '',
          hours: ts.hours || 0,
          status: ts.status,
          isChecked: false,
        }));

        // Replace the existing timesheets with fetched data
        state.myTimesheetData = mappedTimesheets;
        
        // Rebuild calendar view from fetched timesheets
        const calendarMap = new Map<string, IMyTimesheetCalendarEntry>();

        mappedTimesheets.forEach((ts) => {
          const key = `${ts.project}-${ts.task}-${ts.billableType}`;
          
          if (!calendarMap.has(key)) {
            calendarMap.set(key, {
              id: crypto.randomUUID(),
              project: ts.project,
              task: ts.task,
              billableType: ts.billableType,
              myTimesheetEntriesIds: [],
            });
          }
          
          calendarMap.get(key)!.myTimesheetEntriesIds.push(ts.id);
        });

        state.myCalendarViewData = Array.from(calendarMap.values());
      })
      .addCase(fetchTimesheets.rejected, (state, action) => {
        console.error('fetchTimesheets.rejected - Error:', action.payload);
      })
      // Sync timesheet update
      .addCase(syncTimesheetUpdate.pending, () => {
        // Pending state - optimistic update already done
      })
      .addCase(syncTimesheetUpdate.fulfilled, (state, action) => {
        const { timesheetId, updates } = action.payload;
        const index = state.myTimesheetData.findIndex(ts => ts.id === timesheetId);
        
        
        if (index !== -1) {
          state.myTimesheetData[index] = {
            ...state.myTimesheetData[index],
            ...updates,
          };
        } else {
          console.warn('syncTimesheetUpdate.fulfilled - Timesheet not found in state:', timesheetId);
        }
      })
      .addCase(syncTimesheetUpdate.rejected, (state, action) => {
        console.error('syncTimesheetUpdate.rejected - Error:', action.payload);
      });
  },
});

export default myTimesheetSlice.reducer;
export const {  
  setAllTimesheets,
  setMyTimesheetData, 
  updateMyTimesheetEntry, 
  updateMyTimesheetById,
  goToPreviousWeek,
  goToNextWeek,
  setCurrentWeek,
  addCalendarViewRow,
  addEmptyCalendarRow,
  updateCalendarRow,
  deleteCalendarRow
} = myTimesheetSlice.actions;
