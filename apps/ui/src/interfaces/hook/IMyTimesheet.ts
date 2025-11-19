import { IMyTimesheetTableEntry } from "../layout/ITableProps";

export interface IUseMyTimesheetReturn {
  // States
  fetchTimesheets: IMyTimesheetTableEntry[];
  newTimesheets: IMyTimesheetTableEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addNewTimesheet: (timesheet: IMyTimesheetTableEntry) => void;
  updateTimesheet: (id: string, updates: Partial<IMyTimesheetTableEntry>) => void;
}