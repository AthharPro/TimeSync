import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { IMyTimesheetTableEntry, ITimesheetState } from '../../interfaces';

const initialState: ITimesheetState = {
  myTimesheetData: [],
};

const myTimesheetSlice = createSlice({
  name: 'myTimesheet',
  initialState,
  reducers: {

    setMyTimesheetData: (state, action: PayloadAction<IMyTimesheetTableEntry>) => {
      state.myTimesheetData.push(action.payload);
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
        state.myTimesheetData[index] = { ...state.myTimesheetData[index], ...updates };
      }
    }
  },
});

export default myTimesheetSlice.reducer;
export const {  setMyTimesheetData, updateMyTimesheetEntry, updateMyTimesheetById } =
  myTimesheetSlice.actions;
