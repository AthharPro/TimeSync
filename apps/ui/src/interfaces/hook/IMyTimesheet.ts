import { WeekDay } from "../component";
import { IMyTimesheetCalendarEntry, IMyTimesheetTableEntry } from "../layout/ITableProps";
import { BillableType } from "@tms/shared";

export interface IUseMyTimesheetReturn {
  // States
  fetchTimesheets: IMyTimesheetTableEntry[];
  newTimesheets: IMyTimesheetTableEntry[];
  myCalendarViewData: IMyTimesheetCalendarEntry[];
  isLoading: boolean;
  error: string | null;
  currentWeekDays: WeekDay[];
  
  // Actions
  addNewTimesheet: (timesheet: IMyTimesheetTableEntry) => void;
  updateTimesheet: (id: string, updates: Partial<IMyTimesheetTableEntry>) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  createEmptyCalendarRow: (project?: string, task?: string, billableType?: BillableType) => void;
  updateCalendar: (oldId: string, newProject: string, newTask: string, newBillableType: BillableType) => void;
  deleteCalendar: (calendarRowId: string) => void;
}