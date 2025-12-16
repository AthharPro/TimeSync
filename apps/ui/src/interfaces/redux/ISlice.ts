import { IMyTimesheetTableEntry,IMyTimesheetCalendarEntry } from "../layout";
import { IAccountTableRow } from "../component/organism/ITable";

export interface ITimesheetState {
  myTimesheetData: IMyTimesheetTableEntry[];
  myCalendarViewData: IMyTimesheetCalendarEntry[];
  currentWeekStart: string; // ISO string of the week's start date (Sunday)
}

 export interface IAccountState{
  accountData: IAccountTableRow[];
 }