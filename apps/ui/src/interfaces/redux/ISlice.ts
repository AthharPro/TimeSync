import { IMyTimesheetTableEntry,IMyTimesheetCalendarEntry, IAccountTableEntry } from "../layout";

export interface ITimesheetState {
  myTimesheetData: IMyTimesheetTableEntry[];
  myCalendarViewData: IMyTimesheetCalendarEntry[];
  currentWeekStart: string; // ISO string of the week's start date (Sunday)
}

 export interface IAccountState{
  accountData: IAccountTableEntry[];
 }