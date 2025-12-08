import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { IMyTimesheetTableEntry, ITimesheetState, IMyTimesheetCalendarEntry } from '../../interfaces';
import { BillableType } from '@tms/shared';


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
};

const myTimesheetSlice = createSlice({
  name: 'myTimesheet',
  initialState,
  reducers: {

    setMyTimesheetData: (state, action: PayloadAction<IMyTimesheetTableEntry>) => {
      state.myTimesheetData.unshift(action.payload);
      
      // Add to calendar view inline
      const data = action.payload;
      const project = data.project;
      const task = data.task;
      const billable = data.billableType;

      // Only add to calendar view if project and task are not empty
      if (!project || !task) {
        console.log('Skipping calendar view - project or task is empty');
        return;
      }

      // Create unique ID with separator to avoid collisions
      const id = `${project}|${task}|${billable}`;
      
      console.log('Adding to calendar view:', { project, task, billable, id });
      
      // Check if entry with this id already exists
      const existingIndex = state.myCalendarViewData.findIndex((entry: IMyTimesheetCalendarEntry) => entry.id === id);

      if (existingIndex !== -1) {
        // Entry exists - add the timesheet ID to its myTimesheetEntriesIds array
        console.log('Found existing calendar entry, adding timesheet ID to myTimesheetEntriesIds');
        if (!state.myCalendarViewData[existingIndex].myTimesheetEntriesIds.includes(data.id)) {
          state.myCalendarViewData[existingIndex].myTimesheetEntriesIds.push(data.id);
        }
      } else {
        // Entry doesn't exist - create a new calendar entry
        console.log('Creating new calendar entry');
        const newCalendarEntry: IMyTimesheetCalendarEntry = {
          id,
          project,
          task,
          billableType: billable,
          myTimesheetEntriesIds: [data.id]
        };
        state.myCalendarViewData.unshift(newCalendarEntry);
      }
      
      console.log('Calendar view data count:', state.myCalendarViewData.length);
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
          console.log('updateMyTimesheetById - Key fields changed, updating calendar view');
          console.log('updateMyTimesheetById - Old entry:', oldEntry);
          console.log('updateMyTimesheetById - Updated entry:', updatedEntry);
          
          // Check if old entry had empty project/task
          const oldHasEmpty = !oldEntry.project || !oldEntry.task;
          const newHasEmpty = !updatedEntry.project || !updatedEntry.task;
          
          // Create old and new IDs
          const oldId = `${oldEntry.project}|${oldEntry.task}|${oldEntry.billableType}`;
          const newId = `${updatedEntry.project}|${updatedEntry.task}|${updatedEntry.billableType}`;
          
          console.log('updateMyTimesheetById - Old ID:', oldId, 'New ID:', newId, 'oldHasEmpty:', oldHasEmpty, 'newHasEmpty:', newHasEmpty);
          
          if (oldId !== newId) {
            // IDs are different - need to move entry to different calendar row
            
            // 1. Remove timesheet ID from old calendar entry (only if old had valid project/task)
            if (!oldHasEmpty) {
              const oldCalendarIndex = state.myCalendarViewData.findIndex(cal => cal.id === oldId);
              if (oldCalendarIndex !== -1) {
                const idIndex = state.myCalendarViewData[oldCalendarIndex].myTimesheetEntriesIds.indexOf(id);
                if (idIndex !== -1) {
                  state.myCalendarViewData[oldCalendarIndex].myTimesheetEntriesIds.splice(idIndex, 1);
                  console.log('updateMyTimesheetById - Removed ID from old calendar row');
                  
                  // If no more timesheet IDs, remove the calendar row
                  if (state.myCalendarViewData[oldCalendarIndex].myTimesheetEntriesIds.length === 0) {
                    state.myCalendarViewData.splice(oldCalendarIndex, 1);
                    console.log('updateMyTimesheetById - Removed empty calendar row');
                  }
                } else {
                  console.log('updateMyTimesheetById - WARNING: Timesheet ID not found in old calendar row');
                }
              } else {
                console.log('updateMyTimesheetById - WARNING: Old calendar row not found:', oldId);
              }
            }
            
            // 2. Add timesheet ID to new calendar entry (only if new has valid project/task)
            if (!newHasEmpty) {
              const newCalendarIndex = state.myCalendarViewData.findIndex(cal => cal.id === newId);
              if (newCalendarIndex !== -1) {
                // Calendar entry exists - add ID to it
                if (!state.myCalendarViewData[newCalendarIndex].myTimesheetEntriesIds.includes(id)) {
                  state.myCalendarViewData[newCalendarIndex].myTimesheetEntriesIds.push(id);
                  console.log('updateMyTimesheetById - Added to existing calendar row');
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
                console.log('updateMyTimesheetById - Created new calendar row');
              }
            }
          } else {
            console.log('updateMyTimesheetById - Same ID, no calendar row changes needed');
          }
          // Note: If oldId === newId, no need to move the ID, it stays in the same calendar row
        }
        // Note: For non-key field updates (hours, description, etc.), the ID reference stays the same
      } else {
        console.log('updateMyTimesheetById - WARNING: Timesheet entry not found:', id);
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
        console.log('addCalendarViewRow - Skipping, project or task is empty');
        return;
      }

      // Create unique ID with separator to avoid collisions
      const id = `${project}|${task}|${billable}`;
      
      console.log('addCalendarViewRow - Adding:', { project, task, billable, id });
      
      // Check if entry with this id already exists
      const existingIndex = state.myCalendarViewData.findIndex((entry: IMyTimesheetCalendarEntry) => entry.id === id);

      if (existingIndex !== -1) {
        // Entry exists - add the timesheet ID to its myTimesheetEntriesIds array
        console.log('addCalendarViewRow - Found existing, adding timesheet ID');
        if (!state.myCalendarViewData[existingIndex].myTimesheetEntriesIds.includes(data.id)) {
          state.myCalendarViewData[existingIndex].myTimesheetEntriesIds.push(data.id);
        }
      } else {
        // Entry doesn't exist - create a new calendar entry
        console.log('addCalendarViewRow - Creating new entry');
        const newCalendarEntry: IMyTimesheetCalendarEntry = {
          id,
          project,
          task,
          billableType: billable,
          myTimesheetEntriesIds: [data.id]
        };
        state.myCalendarViewData.unshift(newCalendarEntry);
      }
      
      console.log('addCalendarViewRow - Calendar data count:', state.myCalendarViewData.length);
    },

    // Add empty calendar row for direct creation in calendar view
    addEmptyCalendarRow: (state, action: PayloadAction<{ project?: string; task?: string; billableType?: BillableType }>) => {
      const { project = 'New Project', task = 'New Task', billableType = BillableType.NonBillable } = action.payload;
      const id = `${project}|${task}|${billableType}`;
      
      console.log('addEmptyCalendarRow - Creating:', { project, task, billableType, id });
      
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
        console.log('addEmptyCalendarRow - Created new calendar row');
      } else {
        console.log('addEmptyCalendarRow - Calendar row already exists');
      }
    },

    // Update calendar row metadata (project, task, billableType)
    updateCalendarRow: (state, action: PayloadAction<{ oldId: string; newProject: string; newTask: string; newBillableType: BillableType }>) => {
      const { oldId, newProject, newTask, newBillableType } = action.payload;
      const newId = `${newProject}|${newTask}|${newBillableType}`;
      
      console.log('updateCalendarRow:', { oldId, newId });
      
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
          console.log('Merged into existing calendar row and removed old');
        } else {
          // Update in place
          state.myCalendarViewData[oldIndex] = {
            ...oldRow,
            id: newId,
            project: newProject,
            task: newTask,
            billableType: newBillableType
          };
          console.log('Updated calendar row in place');
        }
      }
    },

    // Delete calendar row and all associated timesheets
    deleteCalendarRow: (state, action: PayloadAction<string>) => {
      const calendarRowId = action.payload;
      console.log('deleteCalendarRow - Deleting:', calendarRowId);
      
      const calendarIndex = state.myCalendarViewData.findIndex(row => row.id === calendarRowId);
      if (calendarIndex !== -1) {
        const calendarRow = state.myCalendarViewData[calendarIndex];
        
        // Delete all associated timesheet entries
        const timesheetIdsToDelete = calendarRow.myTimesheetEntriesIds;
        console.log('deleteCalendarRow - Deleting timesheets:', timesheetIdsToDelete);
        
        state.myTimesheetData = state.myTimesheetData.filter(
          timesheet => !timesheetIdsToDelete.includes(timesheet.id)
        );
        
        // Remove the calendar row
        state.myCalendarViewData.splice(calendarIndex, 1);
        console.log('deleteCalendarRow - Deleted calendar row and associated timesheets');
      } else {
        console.log('deleteCalendarRow - Calendar row not found');
      }
    },
  },
});

export default myTimesheetSlice.reducer;
export const {  
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
