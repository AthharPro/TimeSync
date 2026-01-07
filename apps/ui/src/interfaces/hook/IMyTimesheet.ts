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
  currentWeekStart: Date;
  
  // Actions
  addNewTimesheet: (timesheet: IMyTimesheetTableEntry) => void;
  updateTimesheet: (id: string, updates: Partial<IMyTimesheetTableEntry>) => void;
  syncUpdateTimesheet: (id: string, updates: Partial<IMyTimesheetTableEntry>) => Promise<void>;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  createEmptyCalendarRow: (project?: string, team?: string, task?: string, billableType?: BillableType) => void;
  updateCalendar: (oldId: string, newProject?: string, newTeam?: string, newTask?: string, newBillableType?: BillableType) => void;
  deleteCalendar: (calendarRowId: string) => void;
  loadTimesheets: (startDate?: Date, endDate?: Date) => Promise<void>;
  submitTimesheets: () => Promise<any>;
  submitCurrentWeekTimesheets: () => Promise<any>;
  deleteSelectedTimesheets: () => Promise<any>;
}